namespace EveryAngle.OData.DTO
{
    /// <summary>
    /// Using Angle composite key with Dictionary to always produce O(1) when finding a matching item with,
    /// InternalId, BusinessId, Uri
    /// e.g.: Angles.TryGet(new AngleCompositeKey(internalId: angleId), out returningAngle)
    /// </summary>
    public class AngleCompositeKey : BaseCompositeKey, IBaseCompositeKey
    {
        public AngleCompositeKey() //NOSONAR
        {

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
            unchecked //NOSONAR
            {
                // we only get/addnew object, don't need to bother with update.
                return 1;
            }
        }
    }
}
