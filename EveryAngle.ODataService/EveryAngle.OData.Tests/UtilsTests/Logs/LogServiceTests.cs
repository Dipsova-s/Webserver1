using EveryAngle.OData.Utils.Logs;
using NUnit.Framework;
using System;

namespace EveryAngle.OData.Tests.UtilsTests.Logs
{
    // Assume that Log4Net is already tested from thier creator, here's just testing for an execution
    [TestFixture(Category = "Utilities")]
    public class LogServiceTests : UnitTestBase
    {
        #region setup/teardown

        [SetUp]
        public void Setup()
        {

        }

        [TearDown]
        public void TearDown()
        {

        }

        #endregion

        #region tests

        [TestCase("logging_test_message")]
        public void Can_ExecuteLogService(string loggingMessage)
        {
            Exception exception = new Exception();

            LogService.Error(loggingMessage);
            LogService.Error(loggingMessage, exception);

            LogService.Info(loggingMessage);
            LogService.Info(loggingMessage, exception);

            LogService.Warn(loggingMessage);
            LogService.Warn(loggingMessage, exception);

            LogService.Logs(LogLevel.INFO, loggingMessage, exception);
            LogService.Logs(LogLevel.ERROR, loggingMessage, exception);
            LogService.Logs(LogLevel.WARN, loggingMessage, exception);
        }

        #endregion
    }
}
