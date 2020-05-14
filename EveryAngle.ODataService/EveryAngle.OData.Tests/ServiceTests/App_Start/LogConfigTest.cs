using NUnit.Framework;
using EveryAngle.OData.Service.App_Start;
using System.Xml;

namespace EveryAngle.OData.Tests.ServiceTests
{
    class LogConfigTest : UnitTestBase
    {
        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            // setup
        }

        [TearDown]
        public void TearDown()
        {
            // tear down
        }

        #endregion

        #region tests

        [TestCase(@"\log\", "10")]
        [TestCase(@"\log\OData\", "60")]
        public void Can_Configure_Appenders(string logPath, string maxLogFileNumber)
        {
            XmlDocument doc = new XmlDocument();
            doc.LoadXml("<?xml version=\"1.0\"?> \n" +
            "<odataLog4net> \n" +
            "   <appender name = \"TestingAppender\"> \n" +
            "   </appender> \n" +
            "</odataLog4net>");
            XmlElement element = doc["odataLog4net"];
            XmlElement odataLog4net = doc.CreateElement("log4net");

            LogConfig.ConfigureAppenders(element, odataLog4net, logPath, maxLogFileNumber);

            Assert.AreEqual(odataLog4net["appender"]["file"].Attributes["value"].Value, logPath);
            Assert.AreEqual(odataLog4net["appender"]["maxSizeRollBackups"].Attributes["value"].Value, maxLogFileNumber);
        }
        #endregion
    }
}
