using EveryAngle.OData.IntegrationTests.Clients;
using NUnit.Framework;
using System;
using System.Configuration;

namespace EveryAngle.OData.IntegrationTests.Base
{
    public class TestBase
    {
        protected Shared.TestContext context;
        protected RestService restClient;
        protected ODataService odataClient;

        public static bool UseCommandLineBaseUriSetting { get; set; }
        public static bool UseCommandLineODataUriSetting { get; set; }
        public static Uri BaseUri { get; set; }
        public static Uri ODataUri { get; set; }
        public static string TestCategories { get; set; }
        public static string Thumbprint { get; set; }

        [SetUp]
        public void BaseSetUp()
        {
            restClient = new RestService();
            odataClient = new ODataService();

            if (!UseCommandLineBaseUriSetting)
            {
                var baseUriSetting = ConfigurationManager.AppSettings["BaseUri"];
                if (!String.IsNullOrEmpty(baseUriSetting))
                    BaseUri = new Uri(baseUriSetting);
            }

            if (!UseCommandLineODataUriSetting)
            {
                var oDataUriSetting = ConfigurationManager.AppSettings["ODataUri"];
                if (!String.IsNullOrEmpty(oDataUriSetting))
                    ODataUri = new Uri(oDataUriSetting);
            }

            context = GetTestContext();
        }

        private Shared.TestContext GetTestContext()
        {
            return new Shared.TestContext
            {
                BaseUri = BaseUri,
                ODataUri = ODataUri,
                Thumbprint = Thumbprint,
                AdminUser = new Models.User("eaadmin", "P@ssw0rd"),
                OdataUser = new Models.User("odatauser", "P@ssw0rd")
            };
        }
    }
}