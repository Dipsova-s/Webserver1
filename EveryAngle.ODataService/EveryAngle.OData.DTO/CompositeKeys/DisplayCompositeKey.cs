namespace EveryAngle.OData.DTO
{
    /// <summary>
    /// Using Display composite key with Dictionary to always produce O(1) when finding a matching item with,
    /// InternalId, BusinessId, Uri
    /// e.g.: Displays.TryGet(new DisplayCompositeKey(internalId: displayId), out returningDisplay)
    /// </summary>
    public class DisplayCompositeKey : BaseCompositeKey, IBaseCompositeKey
    {
        public DisplayCompositeKey() //NOSONAR
        {

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
            unchecked //NOSONAR
            {
                // we only get/addnew object, don't need to bother with update.
                return 1;
            }
        }
    }
}
