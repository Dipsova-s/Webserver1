using EveryAngle.ManagementConsole.Localization;
using NUnit.Framework;

namespace EveryAngle.ManagementConsole.Test.Localization
{
    // this can only be tested as if it's not empty case, a result depends on running machine.
    public class UserCultureTests : UnitTestBase
    {
        #region setup/teardown

        [SetUp]
        public override void Setup()
        {
            InitiateTestingContext();
            base.Setup();
        }

        #endregion

        #region tests    

        [TestCase]
        public void Can_GetScriptCulture()
        {
            Assert.IsNotNullOrEmpty(UserCulture.GetScriptCulture());
        }

        [TestCase]
        public void Can_GetCultureLetter()
        {
            Assert.IsNotNullOrEmpty(UserCulture.GetCultureLetter());
        }

        [TestCase("en", "en")]
        [TestCase("th", "th")]
        [TestCase("da", "da")]
        [TestCase("fr", "fr")]
        [TestCase("de", "de")]
        [TestCase("nl", "nl")]
        [TestCase("NO_EXIST", "en")]
        public void Can_GetCultureLetter_ByString(string letterName, string expectedValue)
        {
            Assert.IsNotNullOrEmpty(UserCulture.GetCultureLetter(letterName));
            Assert.AreEqual(expectedValue, UserCulture.GetCultureLetter(letterName));
        }

        [TestCase]
        public void Can_GetLocalization()
        {
            Assert.IsNotNullOrEmpty(UserCulture.GetLocalization());
        }

        [TestCase]
        public void Can_GetCaption()
        {
            Assert.IsNotNullOrEmpty(UserCulture.GetCaption());
        }

        #endregion
    }
}
