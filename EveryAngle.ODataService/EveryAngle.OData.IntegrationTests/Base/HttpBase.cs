using EveryAngle.OData.IntegrationTests.Shared;

namespace EveryAngle.OData.IntegrationTests.Base
{
    public abstract class HttpBase
    {
        public abstract dynamic Get(TestContext context, string resourceUrl);

        public abstract dynamic Put(TestContext context, string resourceUrl, string body);

        public abstract dynamic Post(TestContext context, string resourceUrl, string body);

        public abstract dynamic Delete(TestContext context, string resourceUrl);
    }
}