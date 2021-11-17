using EveryAngle.ManagementConsole.Helpers.AngleWarnings.Helpers;
using NUnit.Framework;

namespace EveryAngle.ManagementConsole.Test.AngleWarningsInput
{
    public class ArrayHelperTests : UnitTestBase
    {
        [TestCase]
        public void AddElement_ShouldSucceed()
        {
            string[] stringArray = new string[5] { "0", "1", "2", "3", "4"};

            ArrayHelper.AddElementToStringArray(ref stringArray, "5");

            Assert.AreEqual(6, stringArray.Length);
            Assert.IsTrue(stringArray[5] == "5");
        }
    }
}
