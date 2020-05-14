using EveryAngle.OData.Utils.Logs;
using log4net.Appender;
using log4net.Repository;
using System;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;
using System.Xml;

namespace EveryAngle.OData.Service.App_Start
{
    public static class LogConfig
    {
        public static void Configure(HttpServerUtility server)
        {
            string logPath = ConfigurationManager.AppSettings["LogFileFolder"].ToString();
            string maxLogFileNumber = ConfigurationManager.AppSettings["LogFileMaxNumber"].ToString();

            bool isBackSlash = logPath.EndsWith(@"\");
            logPath = logPath + ((isBackSlash) ? "" : @"\");

            // in order to working as an alias site which is already using log4net as the log operation
            // aslias's log4net need to create a new sectiondynamically depends on named 'odataLog4net'(see. web.config)
            XmlElement element = (XmlElement)ConfigurationManager.GetSection("odataLog4net");
            XmlElement odataLog4net = element.OwnerDocument.CreateElement("log4net");

            // append to a new settings
            ConfigureAppenders(element, odataLog4net, logPath, maxLogFileNumber);

            // use as configure
            log4net.Config.XmlConfigurator.Configure(odataLog4net);

        }

        public static void ConfigureAppenders(XmlElement element, XmlElement odataLog4net, string logPath, string maxLogFileNumber)
        {
            for (int i = 0; i < element.ChildNodes.Count; i++)
            {
                XmlNode child = element.ChildNodes[i];
                if (child.Name == "appender")
                {
                    XmlElement file = element.OwnerDocument.CreateElement("file");
                    XmlElement maxSizeRollBackups = element.OwnerDocument.CreateElement("maxSizeRollBackups");
                    file.SetAttribute("value", logPath);
                    maxSizeRollBackups.SetAttribute("value", maxLogFileNumber);

                    child.AppendChild(file);
                    child.AppendChild(maxSizeRollBackups);
                }
                odataLog4net.AppendChild(child.CloneNode(true));
            }
        }
    }
}