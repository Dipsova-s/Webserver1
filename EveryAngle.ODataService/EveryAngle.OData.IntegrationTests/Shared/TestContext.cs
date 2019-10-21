using EveryAngle.OData.IntegrationTests.Models;
using System;

namespace EveryAngle.OData.IntegrationTests.Shared
{
    public class TestContext
    {
        public Uri BaseUri { get; set; }

        public Uri ODataUri { get; set; }

        public int Timeout { get; set; }

        public User AdminUser { get; set; }

        public User OdataUser { get; set; }
        public string Thumbprint { get; set; }
    }
}