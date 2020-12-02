using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Reflection;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using System.Web.SessionState;
using EveryAngle.WebClient.Web.Filters.ActionFilters;
using Moq;
using NUnit.Framework;

namespace EveryAngle.WebClient.Web.CS.Tests.Filters.ActionFilters
{
    [TestFixture]
    // Limited tests because other paths cannot be mocked.
    public class IsUserLoggedInActionAttributeTests
    {
        private HttpSessionStateContainer _sessionContainer;

        // SUT
        private IsUserLoggedInActionAttribute _filter;

        [SetUp]
        public void Setup()
        {
            var data = new Dictionary<string, object>
            {
                {"Authentication", "{Cookies: 'someAuthCookieIHope'}"}
            };

            HttpContext.Current = new HttpContext(new HttpRequest(string.Empty, "http://localhost", "?redirect=to_new_page"), new HttpResponse(TextWriter.Null));
            HttpContext.Current.Items["owin.Environment"] = data;

            _sessionContainer = new HttpSessionStateContainer("id", new SessionStateItemCollection(),
                new HttpStaticObjectsCollection(), 10, true,
                HttpCookieMode.AutoDetect,
                SessionStateMode.InProc, false);

            HttpContext.Current.Items["AspSession"] =
                typeof(HttpSessionState).GetConstructor(
                        BindingFlags.NonPublic | BindingFlags.Instance,
                        null, CallingConventions.Standard,
                        new[] { typeof(HttpSessionStateContainer) },
                        null)
                    .Invoke(new object[] { _sessionContainer });

            _filter = new IsUserLoggedInActionAttribute();
        }

        [Test]
        public void OnActionExecuting_SetsThreadCultureToEn_WhenUserIsNotLoggedIn()
        {
            var actionContext = new Mock<ActionExecutingContext>();

            _filter.OnActionExecuting(actionContext.Object);

            actionContext.VerifyAll();
            Assert.AreEqual(CultureInfo.CreateSpecificCulture("en"), Thread.CurrentThread.CurrentUICulture, "Expected the CurrentUICulture to be correct");
            Assert.AreEqual(CultureInfo.CreateSpecificCulture("en"), Thread.CurrentThread.CurrentCulture, "Expected the CurrentCulture to be correct");
        }
    }
}
