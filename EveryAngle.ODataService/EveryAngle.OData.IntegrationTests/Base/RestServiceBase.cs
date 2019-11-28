using EveryAngle.OData.IntegrationTests.Helpers;
using EveryAngle.OData.IntegrationTests.Shared;
using EveryAngle.Security.Certificates;
using RestSharp;
using System;
using System.Security.Cryptography.X509Certificates;

namespace EveryAngle.OData.IntegrationTests.Base
{
    public abstract class RestServiceBase : IHttpBase
    {
        private readonly Uri _baseUri;
        public RestServiceBase(Uri baseUri)
        {
            _baseUri = baseUri;
        }

        private RestClient InitRestClient(TestContext context)
        {
            RestClient client = new RestClient(_baseUri);
            client.Timeout = context.Timeout;
            if (IsHttps() && IsHasThumbprint(context))
            {
                client.ClientCertificates = new X509CertificateCollection();
                client.ClientCertificates.Add(CertificateUtils.GetCertificateFromStore(Thumbprint));
            }
            return client;
        }

        private IRestRequest InitRestRequest(TestContext context, Method method, string resourceUrl, string body)
        {
            Uri uri = new Uri(resourceUrl, UriKind.Relative);
            IRestRequest request = new RestRequest(uri, method);
            if (context.AdminUser != null)
            {
                request.AddHeader("Authorization", "Basic " + EncoderHelpers.Base64Encode($"{context.AdminUser.UserName}:{context.AdminUser.Password}"));
            }

            if (!string.IsNullOrEmpty(body))
            {
                request.AddParameter("Application/Json; charset=utf-8", body, ParameterType.RequestBody);
                request.RequestFormat = DataFormat.Json;
            }

            return request;
        }

        public dynamic Delete(TestContext context, string resourceUrl)
        {
            RestClient client = InitRestClient(context);
            IRestRequest request = InitRestRequest(context, Method.DELETE, resourceUrl, string.Empty);
            return client.Execute(request);
        }

        public dynamic Get(TestContext context, string resourceUrl)
        {
            RestClient client = InitRestClient(context);
            IRestRequest request = InitRestRequest(context, Method.GET, resourceUrl, string.Empty);
            return client.Execute(request);
        }

        public dynamic Post(TestContext context, string resourceUrl, string body)
        {
            RestClient client = InitRestClient(context);
            IRestRequest request = InitRestRequest(context, Method.POST, resourceUrl, body);
            return client.Execute(request); 
        }

        public dynamic Put(TestContext context, string resourceUrl, string body)
        {
            RestClient client = InitRestClient(context);
            IRestRequest request = InitRestRequest(context, Method.PUT, resourceUrl, body);
            return client.Execute(request);
        }

        public string Thumbprint { get; set; }

        private bool IsHttps()
        {
            return _baseUri.Scheme.Equals("https", StringComparison.InvariantCultureIgnoreCase);
        }

        private bool IsHasThumbprint(TestContext context)
        {
            return !string.IsNullOrEmpty(context.Thumbprint);
        }
    }
}