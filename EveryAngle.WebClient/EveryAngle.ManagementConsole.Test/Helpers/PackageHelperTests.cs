using EveryAngle.ManagementConsole.Helpers.Controls;
using NUnit.Framework;

namespace EveryAngle.ManagementConsole.Test.Helpers
{
    public class PackageHelperTests : UnitTestBase
    {
        #region private variables

        private PackageHelper _helper = new PackageHelper();

        #endregion

        #region tests

        [TestCase("WC-TEST01-1.eapackage", "WC", "TEST01", "1")]
        [TestCase("MC-TEST02-2.eapackage", "MC", "TEST02", "2")]
        [TestCase("AS-TEST03-3.eapackage", "AS", "TEST03", "3")]
        public void Can_Parse(string fileName, string expectSource, string expectName, string expectVersion)
        {
            PackageHelper package = PackageHelper.Parse(fileName);

            Assert.AreEqual(expectSource, package.Source);
            Assert.AreEqual(expectName, package.Name);
            Assert.AreEqual(expectVersion, package.Version);

            Assert.AreEqual(fileName, package.ToString());
        }

        [TestCase("AS-TEST03-3.eapackage", true)]
        [TestCase("AS-3.eapackage", false)]
        [TestCase("AS.eapackage", false)]
        [TestCase("-.eapackage", false)]
        [TestCase("", false)]
        public void Can_Check_IsValid(string fileName, bool expectedValidity)
        {
            PackageHelper package = string.IsNullOrEmpty(fileName) ? new PackageHelper() : PackageHelper.Parse(fileName);
            Assert.AreEqual(expectedValidity, package.IsValid());
        }

        #endregion
    }
}