using EveryAngle.OData.IntegrationTests.Base;
using EveryAngle.OData.IntegrationTests.Helpers;
using EveryAngle.OData.IntegrationTests.Shared;
using Simple.OData.Client;
using System;

namespace EveryAngle.OData.IntegrationTests.Clients
{
    public class ODataService : HttpBase
    {
        private ODataClientSettings InitODataClientSettings(TestContext context)
        {
            ODataClientSettings settings = new ODataClientSettings(context.ODataUri);
            settings.BeforeRequest = req =>
            {
                if (context.OdataUser != null)
                {
                    req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", EncoderHelpers.Base64Encode($"{context.OdataUser.UserName}:{context.OdataUser.Password}"));
                }
            };
            return settings;
        }

        private ODataClient InitODataRequest(TestContext context, string body)
        {
            //Method can be use later when we implement CRUD not sure ....
            ODataClient client = new ODataClient(InitODataClientSettings(context));
            return client;
        }

        public override dynamic Get(TestContext context, string collectionname)
        {
            ODataClient client = InitODataRequest(context, string.Empty);
            return client;
        }

        //The methods below can be done later
        public override dynamic Delete(TestContext context, string resourceUrl)
        {
            throw new NotImplementedException();
        }

        public override dynamic Post(TestContext context, string resourceUrl, string body)
        {
            throw new NotImplementedException();
        }

        public override dynamic Put(TestContext context, string resourceUrl, string body)
        {
            throw new NotImplementedException();
        }
    }
}