using EveryAngle.OData.IntegrationTests.Base;
using Newtonsoft.Json;
using RestSharp;
using System.Collections.Generic;

namespace EveryAngle.OData.IntegrationTests.Clients
{
    public abstract class RestService<THttp, TResponse> : IRestService<TResponse>
        where THttp : IHttpBase 
        where TResponse : class
    {
        protected string route;
        protected IHttpBase http;
        private readonly Shared.TestContext _testContext;

        public RestService(Shared.TestContext testContext, IHttpBase httpBase)
        {
            _testContext = testContext;
            http = httpBase;
        }

        public RestResponseResultContainer<IEnumerable<TResponse>> GetAll()
        {
            IRestResponse response = http.Get(_testContext, route);
            var result = JsonConvert.DeserializeObject<IEnumerable<TResponse>>(response.Content);
            return new RestResponseResultContainer<IEnumerable<TResponse>>(response, result);
        }

        public RestResponseResultContainer<TResponse> Get(string id = "")
        {
            IRestResponse response = http.Get(_testContext, !string.IsNullOrEmpty(id) ? $"{route}/{id}" : route);
            var result = JsonConvert.DeserializeObject<TResponse>(response.Content);
            return new RestResponseResultContainer<TResponse>(response, result);
        }

        public RestResponseResultContainer<TResponse> GetByQueryStringParameter(string queryStringParameter = "")
        {
            IRestResponse response = http.Get(_testContext, !string.IsNullOrEmpty(queryStringParameter) ? $"{route}?{queryStringParameter}" : route);
            var result = JsonConvert.DeserializeObject<TResponse>(response.Content);
            return new RestResponseResultContainer<TResponse>(response, result);
        }

        public RestResponseResultContainer<TResponse> Post(string payload)
        {
            IRestResponse response = http.Post(_testContext, route, payload);
            var result = JsonConvert.DeserializeObject<TResponse>(response.Content);
            return new RestResponseResultContainer<TResponse>(response, result);
        }

        public RestResponseResultContainer<TResponse> Put(string payload, string id = "")
        {
            IRestResponse response = http.Put(_testContext, !string.IsNullOrEmpty(id) ? $"{route}/{id}" : route, payload);
            var result = JsonConvert.DeserializeObject<TResponse>(response.Content);
            return new RestResponseResultContainer<TResponse>(response, result);
        }

        public RestResponseContainer<TResponse> Delete(string id)
        {
            IRestResponse response = http.Delete(_testContext, $"{route}/{id}");
            return new RestResponseContainer<TResponse>(response);
        }

    }
}
