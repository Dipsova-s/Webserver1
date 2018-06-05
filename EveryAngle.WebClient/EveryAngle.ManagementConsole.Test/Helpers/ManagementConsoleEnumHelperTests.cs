using EveryAngle.ManagementConsole.Helpers;
using NUnit.Framework;

namespace EveryAngle.ManagementConsole.Test.Helpers
{
    public class ManagementConsoleEnumHelperTests : UnitTestBase
    {
        #region private variables

        #endregion

        #region setup/teardown

        #endregion

        #region tests

        [TestCase(MessageType.DEFAULT, "")]
        [TestCase(MessageType.SUCCESS_UPDATED, "Item succesfully updated!")]
        [TestCase(MessageType.REQUIRE_PACKAGE, "Package file is required")]
        [TestCase(MessageType.JSON_INVALID, "Invalid or malformed JSON")]
        [TestCase(MessageType.COMMENT_LIMIT, "The maximum comments(99) has been reached")]
        public void Can_GetEnumMessageType(MessageType messageType, string expectedValue)
        {
            Assert.AreEqual(expectedValue, ManagementConsoleEnumHelper.GetMessage(messageType));
        }

        [TestCase(MessageType.DEFAULT, "DEFAULT")]
        [TestCase(MessageType.SUCCESS_UPDATED, "Item succesfully updated!")]
        [TestCase(MessageType.REQUIRE_PACKAGE, "Package file is required")]
        [TestCase(MessageType.JSON_INVALID, "Invalid or malformed JSON")]
        [TestCase(MessageType.COMMENT_LIMIT, "The maximum comments(99) has been reached")]
        public void Can_GetEnumDescription(MessageType messageType, string expectedValue)
        {
            Assert.AreEqual(expectedValue, ManagementConsoleEnumHelper.GetEnumDescription(messageType));
        }

        #endregion

        #region private/protected functions

        #endregion
    }
}
