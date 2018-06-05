namespace EveryAngle.OData.DTO
{
    /// <summary>
    /// Using Angle composite key with Dictionary to always produce O(1) when finding a matching item with,
    /// InternalId, BusinessId, Uri
    /// e.g.: Angles.TryGet(new AngleCompositeKey(internalId: angleId), out returningAngle)
    /// </summary>
    public class AngleCompositeKey : BaseCompositeKey, IBaseCompositeKey
    {
        public AngleCompositeKey()
        {

        }

        /// <summary>
        /// Query matching keys
        /// </summary>
        /// <param name="internalId">Saving or matching 'internalId'</param>
        /// <param name="uri">Saving or matching 'uri'</param>
        public AngleCompositeKey(int? internalId = null, string uri = "")
        {
            InternalId = internalId;
            Uri = uri;
        }

        public override bool Equals(object obj)
        {
            AngleCompositeKey tmpObj = obj as AngleCompositeKey;
            if (tmpObj == null)
                return false;

            return InternalId == tmpObj.InternalId || Uri == tmpObj.Uri;
        }
        public override int GetHashCode()
        {
            unchecked
            {
                // we only get/addnew object, don't need to bother with update.
                return 1;
            }
        }
    }
}
