namespace EveryAngle.OData.DTO
{
    /// <summary>
    /// Using Display composite key with Dictionary to always produce O(1) when finding a matching item with,
    /// InternalId, BusinessId, Uri
    /// e.g.: Displays.TryGet(new DisplayCompositeKey(internalId: displayId), out returningDisplay)
    /// </summary>
    public class DisplayCompositeKey : BaseCompositeKey, IBaseCompositeKey
    {
        public DisplayCompositeKey()
        {

        }

        /// <summary>
        /// Query matching keys
        /// </summary>
        /// <param name="internalId">Saving or matching 'internalId'</param>
        /// <param name="uri">Saving or matching 'uri'</param>
        public DisplayCompositeKey(int? internalId = null, string uri = "")
        {
            InternalId = internalId;
            Uri = uri;
        }

        public override bool Equals(object obj)
        {
            DisplayCompositeKey tmpObj = obj as DisplayCompositeKey;
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
