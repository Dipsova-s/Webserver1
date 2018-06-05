namespace EveryAngle.OData.DTO
{
    public interface IBaseDTO<TCompositeKey>
         where TCompositeKey : IBaseCompositeKey, new()
    {
        string id { get; set; }
        string uri { get; set; }

        TCompositeKey CompositeKey { get; }
        void SetAsUnavailable();
    }
}
