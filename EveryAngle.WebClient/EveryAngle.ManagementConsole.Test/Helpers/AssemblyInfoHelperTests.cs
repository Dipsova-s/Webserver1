using EveryAngle.ManagementConsole.Helpers;
using NUnit.Framework;
using System.Reflection;

namespace EveryAngle.ManagementConsole.Test.Helpers
{
    public class AssemblyInfoHelperTests : UnitTestBase
    {
        #region tests
        
        [TestCase]
        public void Can_GetFileVersion()
        {
            string fileVersion = AssemblyInfoHelper.GetFileVersion();
            Assert.IsNotNullOrEmpty(fileVersion);
        }

        [TestCase]
        public void Can_GetFileVersion_With_Parameter()
        {
            string fileVersion = AssemblyInfoHelper.GetFileVersion(Assembly.GetExecutingAssembly().Location);
            Assert.IsNotNullOrEmpty(fileVersion);
        }

        [TestCase(@"E:\NOT_EXISTING_DLL\nope.dll")]
        public void Can_GetFileVersion_With_ExpectedException(string executingFileLocation)
        {
            string fileVersion = AssemblyInfoHelper.GetFileVersion(executingFileLocation);
            Assert.IsNotNullOrEmpty(fileVersion);
            Assert.AreEqual(executingFileLocation, fileVersion);
        }

        #endregion
    }
}
