namespace EveryAngle.OData.DTO
{
    public interface IBaseCompositeKey
    {
        int? InternalId { get; set; }
        string Uri { get; set; }
    }
}
