package com.unireserver.backend.service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.unireserver.backend.dto.AssistantChatResponse;
import com.unireserver.backend.dto.BookingResponse;
import com.unireserver.backend.dto.TicketCreateRequest;
import com.unireserver.backend.model.AppUser;
import com.unireserver.backend.model.Booking;
import com.unireserver.backend.model.BookingStatus;
import com.unireserver.backend.model.Facility;
import com.unireserver.backend.model.TicketPriority;
import com.unireserver.backend.repository.BookingRepository;
import com.unireserver.backend.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CampusAssistantService {

    private static final Pattern DATE_PATTERN = Pattern.compile("\\b(\\d{4}-\\d{2}-\\d{2})\\b");
    private static final Pattern TIME_RANGE_PATTERN = Pattern.compile("(?i)\\b(\\d{1,2}(?::\\d{2})?\\s*(?:am|pm)?)\\s*(?:to|-|until)\\s*(\\d{1,2}(?::\\d{2})?\\s*(?:am|pm)?)\\b");
    private static final Pattern SINGLE_TIME_PATTERN = Pattern.compile("(?i)\\b(\\d{1,2}(?::\\d{2})?\\s*(?:am|pm))\\b");
    private static final Pattern TICKET_PRIORITY_PATTERN = Pattern.compile("\\b(low|medium|high|critical)\\b");
    private static final Pattern ATTENDEES_PATTERN = Pattern.compile("\\b(\\d{1,4})\\s*(students|people|attendees)?\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern WEEKDAY_PATTERN = Pattern.compile("(?i)\\b(next\\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\\b");
    private static final String DEFAULT_BOOKING_PURPOSE = "Requested via AI assistant";

    private final BookingService bookingService;
    private final BookingRepository bookingRepository;
    private final FacilityRepository facilityRepository;
    private final MaintenanceTicketService maintenanceTicketService;
    private final ObjectMapper objectMapper;
    private final Map<String, BookingDraft> bookingDrafts = new ConcurrentHashMap<>();

    @Value("${OPENAI_API_KEY:}")
    private String openAiApiKey;

    @Value("${OPENAI_MODEL:gpt-4o-mini}")
    private String openAiModel;

    public AssistantChatResponse processMessage(AppUser user, String rawMessage) {
        String message = rawMessage == null ? "" : rawMessage.trim();
        if (message.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message is required");
        }

        String normalized = message.toLowerCase(Locale.ROOT);

        if (isScheduleSummaryRequest(normalized)) {
            return AssistantChatResponse.builder()
                    .action("SCHEDULE_SUMMARY")
                    .message(buildScheduleSummary(user))
                    .build();
        }

        if (isAvailabilityQuestion(normalized)) {
            return AssistantChatResponse.builder()
                    .action("CHECK_AVAILABILITY")
                    .message(handleAvailabilityRequest(message))
                    .build();
        }

        BookingDraft existingDraft = bookingDrafts.get(user.getId());
        if (existingDraft != null || isBookingRequest(normalized)) {
            return continueBookingConversation(user, message, existingDraft);
        }

        if (isSupportTicketRequest(normalized)) {
            return AssistantChatResponse.builder()
                    .action("CREATE_TICKET")
                    .message(handleTicketRequest(user, message))
                    .build();
        }

        return AssistantChatResponse.builder()
                .action("KNOWLEDGE")
                .message(generateKnowledgeAnswer(user, message))
                .build();
    }

    private String buildScheduleSummary(AppUser user) {
        List<BookingResponse> myBookings = bookingService.getMyBookings(user.getId()).stream()
                .sorted(Comparator.comparing(BookingResponse::getDate)
                        .thenComparing(BookingResponse::getStartTime))
                .toList();

        if (myBookings.isEmpty()) {
            return "You do not have any bookings yet. Ask me to book a resource and include date, time range, and purpose.";
        }

        StringBuilder builder = new StringBuilder("Here is your booking schedule summary:\n");
        myBookings.stream().limit(8).forEach(booking -> builder
                .append("- ")
                .append(booking.getDate())
                .append(" | ")
                .append(booking.getStartTime())
                .append("-")
                .append(booking.getEndTime())
                .append(" | ")
                .append(booking.getFacilityName())
                .append(" | ")
                .append(booking.getStatus())
                .append(" | Purpose: ")
                .append(Optional.ofNullable(booking.getPurpose()).orElse("N/A"))
                .append('\n'));

        if (myBookings.size() > 8) {
            builder.append("... and ").append(myBookings.size() - 8).append(" more bookings.");
        }

        return builder.toString().trim();
    }

    private String handleBookingRequest(AppUser user, String message) {
        List<Facility> facilities = facilityRepository.findAll();
        if (facilities.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No facilities are available for booking right now.");
        }

        Facility facility = findFacilityFromMessage(facilities, message)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "I could not identify the resource. Mention a resource name like Auditorium or A403."
                ));

        LocalDate date = extractDate(message)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "I could not find the booking date. Example: next friday or 2026-05-01."
                ));
        TimeRange timeRange = extractTimeRange(message).orElseGet(() ->
                extractSingleStartTime(message)
                        .map(start -> new TimeRange(start, start.plusHours(1)))
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "I could not find time. Use '3 pm' or '15:00 to 17:00'."
                        ))
        );

        String purpose = extractPurpose(message);
        if (purpose.isBlank()) {
            purpose = "Requested via AI assistant";
        }
        int attendees = extractAttendees(message).orElse(1);

        Booking booking = Booking.builder()
                .facilityId(facility.getId())
                .userId(user.getId())
                .date(date)
                .startTime(timeRange.startTime())
                .endTime(timeRange.endTime())
                .purpose(purpose)
                .expectedAttendees(attendees)
                .build();

        Booking created = bookingService.createBooking(booking);
        return "Booked request submitted for " + facility.getName()
                + " on " + created.getDate()
                + " from " + created.getStartTime()
                + " to " + created.getEndTime()
                + " for " + attendees + " attendee(s). Status: " + created.getStatus() + ".";
    }

    private AssistantChatResponse continueBookingConversation(AppUser user, String message, BookingDraft existingDraft) {
        BookingDraft draft = existingDraft != null ? existingDraft : new BookingDraft();
        String normalized = message.toLowerCase(Locale.ROOT).trim();

        if (normalized.contains("cancel booking request") || normalized.equals("cancel") || normalized.equals("stop")) {
            bookingDrafts.remove(user.getId());
            return AssistantChatResponse.builder()
                    .action("BOOKING_CANCELLED")
                    .message("Booking draft cancelled. Start again whenever you are ready.")
                    .build();
        }

        updateDraftFromMessage(draft, message);

        String missing = nextMissingFieldPrompt(draft);
        if (missing != null) {
            bookingDrafts.put(user.getId(), draft);
            return AssistantChatResponse.builder()
                    .action("BOOKING_FOLLOW_UP")
                    .message(missing)
                    .build();
        }

        String bookingResult = createBookingFromDraft(user, draft);
        bookingDrafts.remove(user.getId());
        return AssistantChatResponse.builder()
                .action("BOOK_RESOURCE")
                .message(bookingResult)
                .build();
    }

    private void updateDraftFromMessage(BookingDraft draft, String message) {
        List<Facility> facilities = facilityRepository.findAll();
        if (draft.facility == null) {
            findFacilityFromMessage(facilities, message).ifPresent(f -> draft.facility = f);
        }
        if (draft.date == null) {
            extractDate(message).ifPresent(date -> draft.date = date);
        }
        if (draft.timeRange == null) {
            Optional<TimeRange> range = extractTimeRange(message);
            if (range.isPresent()) {
                draft.timeRange = range.get();
            } else {
                extractSingleStartTime(message).ifPresent(start -> draft.timeRange = new TimeRange(start, start.plusHours(1)));
            }
        }
        if (draft.attendees == null) {
            extractAttendees(message).ifPresent(count -> draft.attendees = count);
        }
        if (draft.purpose == null) {
            String purpose = extractPurpose(message);
            if (!purpose.isBlank()) {
                draft.purpose = purpose;
            }
        }
    }

    private String nextMissingFieldPrompt(BookingDraft draft) {
        if (draft.facility == null) {
            return "Sure — which resource should I book? (example: Auditorium, A403 Lab)";
        }
        if (draft.date == null) {
            return "Got it. What day should I book it? (example: next friday or 2026-05-09)";
        }
        if (draft.timeRange == null) {
            return "What time should I book? You can say '3 pm' or '15:00 to 17:00'.";
        }
        if (draft.attendees == null) {
            return "How many students/attendees should I include in this booking request?";
        }
        return null;
    }

    private String createBookingFromDraft(AppUser user, BookingDraft draft) {
        Booking booking = Booking.builder()
                .facilityId(draft.facility.getId())
                .userId(user.getId())
                .date(draft.date)
                .startTime(draft.timeRange.startTime())
                .endTime(draft.timeRange.endTime())
                .purpose(draft.purpose == null ? DEFAULT_BOOKING_PURPOSE : draft.purpose)
                .expectedAttendees(draft.attendees)
                .build();

        Booking created = bookingService.createBooking(booking);
        return "Booking request submitted for " + draft.facility.getName()
                + " on " + created.getDate()
                + " from " + created.getStartTime()
                + " to " + created.getEndTime()
                + " for " + draft.attendees + " attendee(s). Status: " + created.getStatus() + ".";
    }

    private String handleTicketRequest(AppUser user, String message) {
        TicketCreateRequest request = new TicketCreateRequest();
        request.setCategory("GENERAL_SUPPORT");
        request.setPriority(extractPriority(message).orElse(TicketPriority.MEDIUM));
        request.setDescription(message);
        request.setPreferredContactDetails(user.getEmail());
        request.setAttachmentUrls(List.of());

        maintenanceTicketService.createTicket(request, user.getId());
        return "Support ticket created successfully. A staff member will review it soon.";
    }

    private String generateKnowledgeAnswer(AppUser user, String message) {
        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            return "I can help with booking resources, creating support tickets, and schedule summaries. "
                    + "For AI knowledge answers, configure OPENAI_API_KEY in backend environment variables.";
        }

        String scheduleContext = buildScheduleSummary(user);
        String prompt = "You are a smart campus assistant for students, lecturers, and instructors. "
                + "Give concise guidance about resources, reservations, and campus support.\n\n"
                + "User role: " + user.getRole() + "\n"
                + "Booking context:\n" + scheduleContext + "\n\n"
                + "User question: " + message;

        try {
            JsonNode body = objectMapper.createObjectNode()
                    .put("model", openAiModel)
                    .set("messages", objectMapper.createArrayNode()
                            .add(objectMapper.createObjectNode()
                                    .put("role", "system")
                                    .put("content", "You are concise, practical, and role-aware."))
                            .add(objectMapper.createObjectNode()
                                    .put("role", "user")
                                    .put("content", prompt)));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                    .header("Authorization", "Bearer " + openAiApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                return "I could not reach the AI service right now, but I can still perform booking and ticket actions.";
            }

            JsonNode parsed = objectMapper.readTree(response.body());
            JsonNode contentNode = parsed.path("choices").path(0).path("message").path("content");
            if (contentNode.isMissingNode() || contentNode.asText().isBlank()) {
                return "I can help with resource bookings, support tickets, and schedule summaries. "
                        + "Ask me with clear details to proceed.";
            }
            return contentNode.asText().trim();
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            return "The AI service is temporarily unavailable. I can still create bookings or tickets for you.";
        } catch (IOException ex) {
            return "The AI service is temporarily unavailable. I can still create bookings or tickets for you.";
        }
    }

    private Optional<Facility> findFacilityFromMessage(List<Facility> facilities, String message) {
        String lower = message.toLowerCase(Locale.ROOT);
        Optional<Facility> exact = facilities.stream()
                .filter(f -> f.getName() != null && lower.contains(f.getName().toLowerCase(Locale.ROOT)))
                .findFirst();
        if (exact.isPresent()) {
            return exact;
        }

        return facilities.stream()
                .filter(f -> f.getName() != null)
                .max(Comparator.comparingInt(f -> facilityMatchScore(lower, f.getName().toLowerCase(Locale.ROOT))))
                .filter(f -> facilityMatchScore(lower, f.getName().toLowerCase(Locale.ROOT)) >= 1);
    }

    private int facilityMatchScore(String messageLower, String facilityNameLower) {
        int score = 0;
        for (String token : facilityNameLower.split("[^a-z0-9]+")) {
            if (token.length() >= 3 && messageLower.contains(token)) {
                score += 2;
            } else if (token.length() == 2 && messageLower.contains(token)) {
                score += 1;
            }
        }
        if (messageLower.contains(facilityNameLower)) {
            score += 4;
        }
        return score;
    }

    private Optional<LocalDate> extractDate(String message) {
        Matcher explicit = DATE_PATTERN.matcher(message);
        if (explicit.find()) {
            return Optional.of(LocalDate.parse(explicit.group(1)));
        }

        Matcher weekdayMatcher = WEEKDAY_PATTERN.matcher(message);
        if (!weekdayMatcher.find()) {
            return Optional.empty();
        }

        boolean forceNextWeek = weekdayMatcher.group(1) != null;
        String weekday = weekdayMatcher.group(2).toUpperCase(Locale.ROOT);
        DayOfWeek target = DayOfWeek.valueOf(weekday);
        LocalDate today = LocalDate.now();
        int delta = target.getValue() - today.getDayOfWeek().getValue();
        if (delta <= 0 || forceNextWeek) {
            delta += 7;
        }
        return Optional.of(today.plusDays(delta));
    }

    private Optional<TimeRange> extractTimeRange(String message) {
        Matcher matcher = TIME_RANGE_PATTERN.matcher(message);
        if (!matcher.find()) {
            return Optional.empty();
        }
        Optional<LocalTime> startOpt = parseFlexibleTime(matcher.group(1));
        Optional<LocalTime> endOpt = parseFlexibleTime(matcher.group(2));
        if (startOpt.isEmpty() || endOpt.isEmpty()) {
            return Optional.empty();
        }
        LocalTime start = startOpt.get();
        LocalTime end = endOpt.get();
        if (!start.isBefore(end)) {
            return Optional.empty();
        }
        return Optional.of(new TimeRange(start, end));
    }

    private Optional<LocalTime> extractSingleStartTime(String message) {
        Matcher matcher = SINGLE_TIME_PATTERN.matcher(message);
        if (!matcher.find()) {
            return Optional.empty();
        }
        return parseFlexibleTime(matcher.group(1));
    }

    private Optional<LocalTime> parseFlexibleTime(String rawTime) {
        String normalized = rawTime.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", "");
        try {
            if (normalized.endsWith("am") || normalized.endsWith("pm")) {
                boolean pm = normalized.endsWith("pm");
                String number = normalized.substring(0, normalized.length() - 2);
                String[] parts = number.split(":");
                int hour = Integer.parseInt(parts[0]);
                int minute = parts.length > 1 ? Integer.parseInt(parts[1]) : 0;
                if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
                    return Optional.empty();
                }
                if (hour == 12) {
                    hour = 0;
                }
                if (pm) {
                    hour += 12;
                }
                return Optional.of(LocalTime.of(hour, minute));
            }
            if (normalized.matches("\\d{1,2}:\\d{2}")) {
                String[] parts = normalized.split(":");
                return Optional.of(LocalTime.of(Integer.parseInt(parts[0]), Integer.parseInt(parts[1])));
            }
            return Optional.empty();
        } catch (RuntimeException ex) {
            return Optional.empty();
        }
    }

    private Optional<Integer> extractAttendees(String message) {
        Matcher matcher = ATTENDEES_PATTERN.matcher(message);
        while (matcher.find()) {
            int value = Integer.parseInt(matcher.group(1));
            String label = matcher.group(2);
            if (label != null || value > 1) {
                return Optional.of(value);
            }
        }
        return Optional.empty();
    }

    private String handleAvailabilityRequest(String message) {
        List<Facility> facilities = facilityRepository.findAll();
        Facility facility = findFacilityFromMessage(facilities, message)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "I could not identify the resource. Try: Is Auditorium available next sunday?"
                ));

        LocalDate date = extractDate(message).orElse(LocalDate.now().plusDays(1));
        Optional<TimeRange> timeRange = extractTimeRange(message);

        List<Booking> dayBookings = bookingRepository.findByFacilityId(facility.getId()).stream()
                .filter(b -> date.equals(b.getDate()))
                .filter(b -> b.getStatus() == BookingStatus.APPROVED || b.getStatus() == BookingStatus.PENDING)
                .toList();

        String dayName = date.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        if (timeRange.isPresent()) {
            TimeRange requested = timeRange.get();
            boolean conflict = dayBookings.stream().anyMatch(b ->
                    requested.startTime().isBefore(b.getEndTime()) && requested.endTime().isAfter(b.getStartTime())
            );
            if (conflict) {
                return facility.getName() + " is not available on " + dayName + " (" + date + ") from "
                        + requested.startTime() + " to " + requested.endTime() + ".";
            }
            return facility.getName() + " is available on " + dayName + " (" + date + ") from "
                    + requested.startTime() + " to " + requested.endTime() + ".";
        }

        if (dayBookings.isEmpty()) {
            return facility.getName() + " is available all day on " + dayName + " (" + date + ").";
        }

        String occupied = dayBookings.stream()
                .limit(4)
                .map(b -> b.getStartTime() + "-" + b.getEndTime())
                .reduce((a, b) -> a + ", " + b)
                .orElse("occupied slots");
        return facility.getName() + " has bookings on " + dayName + " (" + date + "): " + occupied + ". "
                + "You can still request another time slot.";
    }

    private String extractPurpose(String message) {
        String lower = message.toLowerCase(Locale.ROOT);
        int purposeIndex = lower.indexOf("purpose:");
        if (purposeIndex < 0) {
            return "";
        }
        return message.substring(purposeIndex + "purpose:".length()).trim();
    }

    private Optional<TicketPriority> extractPriority(String message) {
        Matcher matcher = TICKET_PRIORITY_PATTERN.matcher(message.toLowerCase(Locale.ROOT));
        if (!matcher.find()) {
            return Optional.empty();
        }
        return Optional.of(TicketPriority.valueOf(matcher.group(1).toUpperCase(Locale.ROOT)));
    }

    private boolean isBookingRequest(String normalizedMessage) {
        return normalizedMessage.contains("book")
                || normalizedMessage.contains("reserve")
                || normalizedMessage.contains("reservation");
    }

    private boolean isAvailabilityQuestion(String normalizedMessage) {
        return normalizedMessage.contains("available")
                || normalizedMessage.contains("availability")
                || normalizedMessage.contains("free");
    }

    private boolean isSupportTicketRequest(String normalizedMessage) {
        return normalizedMessage.contains("create ticket")
                || normalizedMessage.contains("open ticket")
                || normalizedMessage.contains("support ticket")
                || normalizedMessage.contains("report issue")
                || normalizedMessage.contains("maintenance issue");
    }

    private boolean isScheduleSummaryRequest(String normalizedMessage) {
        return normalizedMessage.contains("summary")
                || normalizedMessage.contains("schedule")
                || normalizedMessage.contains("my bookings")
                || normalizedMessage.contains("my reservations");
    }

    private record TimeRange(LocalTime startTime, LocalTime endTime) {
    }

    private static class BookingDraft {
        private Facility facility;
        private LocalDate date;
        private TimeRange timeRange;
        private Integer attendees;
        private String purpose;
    }
}
