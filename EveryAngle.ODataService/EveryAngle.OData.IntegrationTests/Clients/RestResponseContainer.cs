using RestSharp;

namespace EveryAngle.OData.IntegrationTests.Clients
{
    public abstract class RestResponseBase
    {
        public IRestResponse Response { get; set; }
    }

    public class RestResponseContainer<TResponse> : RestResponseBase where TResponse : class
    {
        public RestResponseContainer(IRestResponse response)
        {
            Response = response;
        }
        
    }

    public class RestResponseResultContainer<TResponse> : RestResponseBase where TResponse : class
    {
        public TResponse Result { get; set; }

        public RestResponseResultContainer(IRestResponse response, TResponse result)
        {
            Response = response;
            Result = result;
        }

    }

}
