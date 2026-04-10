# Module E: Reviews & Feedbacks
**Developed by: IT23569140 - Samarakoon J.M.J.B**

## Overview
This module enables users to share their experiences with campus facilities and assets through ratings and reviews. It fosters community feedback and helps administrators identify popular or problematic resources.

## Features
- **Star Ratings**: 1-5 star rating system for resources.
- **Comment Section**: Detailed textual feedback from users.
- **Community Interaction**: Support for "Liking" reviews and responding to feedback.
- **Rating Summary**: Aggregated average rating display for each resource.
- **Sorting & Filtering**: View reviews by recency or rating score.

## Components
- `ReviewSection`: Primary container for submission and listing.
- `ReviewCard`: Display individual feedback with interactive buttons.
- `ReviewStats`: Summary statistics for resource ratings.

## Backend Integration
- API Endpoint: `/api/reviews`
- Model: Supports nested responses for threaded discussions.
- Logic: Service-level calculation for average ratings.
