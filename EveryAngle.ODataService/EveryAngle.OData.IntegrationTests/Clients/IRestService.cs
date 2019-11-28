using System.Collections.Generic;

namespace EveryAngle.OData.IntegrationTests.Clients
{
    public interface IRestService<TResponse> where TResponse : class
    {
        RestResponseResultContainer<IEnumerable<TResponse>> GetAll();
        RestResponseResultContainer<TResponse> Get(string id = "");
        RestResponseResultContainer<TResponse> GetByQueryStringParameter(string queryStringParameter = "");
        RestResponseResultContainer<TResponse> Post(string payload);
        RestResponseResultContainer<TResponse> Put(string payload, string id = "");
        RestResponseContainer<TResponse> Delete(string id);
    }
}
