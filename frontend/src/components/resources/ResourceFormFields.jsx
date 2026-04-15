import FormField from '../ui/FormField'

const ResourceFormFields = ({ formData, onChange, facilityTypes, facilityStatuses, buildings, includeImageUrl = false }) => (
  <div className="ui-field-grid ui-field-grid--two">
    <FormField label="Resource Name" htmlFor="resource-name" required fullWidth>
      <input
        className="ui-input"
        id="resource-name"
        name="name"
        value={formData.name}
        onChange={onChange}
        placeholder="e.g. Grand Lecture Hall A"
        required
      />
    </FormField>

    <FormField label="Type" htmlFor="resource-type" required>
      <select className="ui-select" id="resource-type" name="type" value={formData.type} onChange={onChange}>
        {facilityTypes.map((type) => (
          <option key={type} value={type}>
            {type.replace('_', ' ')}
          </option>
        ))}
      </select>
    </FormField>

    <FormField label="Status" htmlFor="resource-status" required>
      <select className="ui-select" id="resource-status" name="status" value={formData.status} onChange={onChange}>
        {facilityStatuses.map((status) => (
          <option key={status} value={status}>
            {status.replace('_', ' ')}
          </option>
        ))}
      </select>
    </FormField>

    <FormField label="Building" htmlFor="resource-building" required>
      <select className="ui-select" id="resource-building" name="building" value={formData.building} onChange={onChange}>
        {buildings.map((building) => (
          <option key={building} value={building}>
            {building}
          </option>
        ))}
      </select>
    </FormField>

    <FormField label="Floor Number" htmlFor="resource-floor">
      <input
        className="ui-input"
        id="resource-floor"
        type="number"
        name="floorNumber"
        value={formData.floorNumber}
        onChange={onChange}
        placeholder="e.g. 2"
      />
    </FormField>

    <FormField label="Seating Capacity" htmlFor="resource-capacity" required>
      <input
        className="ui-input"
        id="resource-capacity"
        type="number"
        name="capacity"
        value={formData.capacity}
        onChange={onChange}
        placeholder="e.g. 150"
        required
      />
    </FormField>

    {includeImageUrl ? (
      <FormField label="Image URL" htmlFor="resource-image" fullWidth>
        <input
          className="ui-input"
          id="resource-image"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={onChange}
          placeholder="https://..."
        />
      </FormField>
    ) : null}

    <FormField label="Note" htmlFor="resource-note" fullWidth>
      <textarea
        className="ui-textarea"
        id="resource-note"
        name="note"
        value={formData.note}
        onChange={onChange}
        placeholder="Provide details about equipment, accessibility, or special requirements."
      ></textarea>
    </FormField>
  </div>
)

export default ResourceFormFields
