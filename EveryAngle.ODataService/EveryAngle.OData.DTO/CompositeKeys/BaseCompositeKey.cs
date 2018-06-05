namespace EveryAngle.OData.DTO
{
    public abstract class BaseCompositeKey
    {
        public virtual int? InternalId { get; set; }
        public virtual string Uri { get; set; }
    }
}
