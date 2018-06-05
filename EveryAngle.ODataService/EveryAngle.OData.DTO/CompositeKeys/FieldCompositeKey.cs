namespace EveryAngle.OData.DTO
{
    /// <summary>
    /// Using Field composite key with Dictionary to always produce O(1) when finding a matching item with,
    /// InternalId, BusinessId, Uri
    /// e.g.: Fields.TryGet(new FieldCompositeKey(internalId: fieldId), out returningField)
    /// </summary>
    public class FieldCompositeKey : BaseCompositeKey, IBaseCompositeKey
    {
        public string BusinessId { get; set; }
        public string UniqueXMLElementKey { get; set; }

        public override bool Equals(object obj)
        {
            FieldCompositeKey tmpObj = obj as FieldCompositeKey;

            return tmpObj != null &&
                BusinessId.Equals(tmpObj.BusinessId) ||
                UniqueXMLElementKey.Equals(tmpObj.UniqueXMLElementKey);
        }
        public override int GetHashCode()
        {
            return 1;
        }
    }
}
