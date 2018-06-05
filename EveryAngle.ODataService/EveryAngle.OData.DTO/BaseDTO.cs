using System.Linq;

namespace EveryAngle.OData.DTO
{
    public abstract class BaseDTO<TCompositeKey>
         where TCompositeKey : IBaseCompositeKey, new()
    {
        protected BaseDTO()
        {
            is_available = true;
        }

        public string id { get; set; }
        public string uri { get; set; } = "0";

        #region internal use

        public bool is_available { get; private set; }

        private TCompositeKey _compositeKey;
        public virtual TCompositeKey CompositeKey
        {
            get
            {
                if (_compositeKey == null)
                    _compositeKey = CreateCompositeKey();
                return _compositeKey;
            }
        }

        public virtual TCompositeKey CreateCompositeKey()
        {
            string[] splittedUri = uri.Split('/');
            int internalId = int.Parse(splittedUri.Last());
            return new TCompositeKey { InternalId = internalId, Uri = uri };
        }

        public virtual void SetAsUnavailable()
        {
            is_available = false;
        }

        #endregion
    }
}
