using EveryAngle.OData.IntegrationTests.Shared;

namespace EveryAngle.OData.IntegrationTests.Base
{
    public interface IHttpBase
    {
        dynamic Get(TestContext context, string resourceUrl);

        dynamic Put(TestContext context, string resourceUrl, string body);

        dynamic Post(TestContext context, string resourceUrl, string body);

        dynamic Delete(TestContext context, string resourceUrl);
    }
}