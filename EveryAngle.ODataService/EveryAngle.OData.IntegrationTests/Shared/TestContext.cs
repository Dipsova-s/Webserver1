using EveryAngle.OData.IntegrationTests.Models;
using System;

namespace EveryAngle.OData.IntegrationTests.Shared
{
    public class TestContext
    {
        public Uri BaseUri { get; set; }

        public Uri ODataUri { get; set; }
        public Uri ODataApiUri
        {
            get
            {
                Uri.TryCreate(string.Format("{0}/api", ODataUri.AbsoluteUri), UriKind.Absolute, out Uri uri);
                return uri;
            }
        }
        public Uri ODataClientUri
        {
            get
            {
                Uri.TryCreate(string.Format("{0}/odata", ODataUri.AbsoluteUri), UriKind.Absolute, out Uri uri);
                return uri;
            }
        }
        public int Timeout { get; set; }

        public User AdminUser { get; set; }

        public User OdataUser { get; set; }
        public string Thumbprint { get; set; }
    }
}