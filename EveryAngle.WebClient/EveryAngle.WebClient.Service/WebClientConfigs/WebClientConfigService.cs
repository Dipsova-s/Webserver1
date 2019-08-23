using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.WebClientSettings;
using EveryAngle.Shared.Helpers;
using System;
using System.Linq;
using System.Xml;


namespace EveryAngle.WebClient.Service.WebClientConfigs
{
    public class WebClientConfigService : IWebClientConfigService
    {
        public WebClientConfigViewModel ApplyOverrideToWebClientConfigViewModel(WebClientConfigViewModel webClientConfigViewModel)
        {
            XmlNode nodelist = WebConfigHelper.GetOverRideWebConfig();

            foreach (XmlNode xnn in nodelist.ChildNodes)
            {
                if (xnn.Attributes != null && xnn.Attributes.Count > 1)
                {
                    string configKey = xnn.Attributes[0].Value.ToLower();
                    string configValue = xnn.Attributes[1].Value;

                    switch (configKey)
                    {
                        case "ajax-timeout-expiration-in-seconds":
                            int ajaxTimeoutExpirationInSeconds = 60;
                            int.TryParse(configValue, out ajaxTimeoutExpirationInSeconds);
                            webClientConfigViewModel.AjaxTimeoutExpirationInSeconds = ajaxTimeoutExpirationInSeconds;
                            break;
                        case "showangleanddisplayid":
                            bool showAngleAndDisplayID;
                            bool.TryParse(configValue, out showAngleAndDisplayID);
                            webClientConfigViewModel.ShowAngleAndDisplayID = showAngleAndDisplayID;
                            break;
                        case "maxnumberofmasschangeitems":
                            int maxNumberOfMassChangeItems = 1000;
                            int.TryParse(configValue, out maxNumberOfMassChangeItems);
                            webClientConfigViewModel.MaxNumberOfMassChangeItems = maxNumberOfMassChangeItems;
                            break;
                        case "maxnumberofdashboard":
                            int maxNumberOfDashboard = 9;
                            int.TryParse(configValue, out maxNumberOfDashboard);
                            webClientConfigViewModel.MaxNumberOfDashboard = maxNumberOfDashboard;
                            break;
                        case "showerrorsourceuri":
                            bool showErrorSourceUri;
                            bool.TryParse(configValue, out showErrorSourceUri);
                            webClientConfigViewModel.ShowErrorSourceUri = showErrorSourceUri;
                            break;
                        case "enableoptimizations":
                            bool enableOptimizations;
                            bool.TryParse(configValue, out enableOptimizations);
                            webClientConfigViewModel.EnableOptimizations = enableOptimizations;
                            break;
                        case "maxlogfilenumber":
                            int maxLogFileNumber = 9;
                            int.TryParse(configValue, out maxLogFileNumber);
                            webClientConfigViewModel.MaxLogFileNumber = maxLogFileNumber;
                            break;
                        case "maxlogfilesize":
                            int maxLogFileSize = 4193404;
                            int.TryParse(configValue, out maxLogFileSize);
                            /* M4-13868: Modified unit of max file size from bytes to mega bytes */
                            webClientConfigViewModel.MaxLogFileSize = maxLogFileSize / (1024 * 1024);
                            break;
                        case "dashboardrefreshintervaltime":
                            int dashboardRefreshIntervalTime = 9;
                            int.TryParse(configValue, out dashboardRefreshIntervalTime);
                            webClientConfigViewModel.DashboardRefreshIntervalTime = dashboardRefreshIntervalTime;
                            break;
                        case "googleanalyticsid":
                            webClientConfigViewModel.GoogleAnalyticsId = configValue;
                            break;
                        case "enablegotosap":
                            bool.TryParse(configValue, out bool enableGoToSAP);
                            webClientConfigViewModel.EnableGoToSAP = enableGoToSAP;
                            break;
                        default:
                            break;
                    }
                }

            }
            return webClientConfigViewModel;
        }

        public WebClientConfigViewModel GetWebClientWebConfig()
        {
            WebClientConfigViewModel webClientConfigViewModel = new WebClientConfigViewModel();

            #region General

            int ajaxTimeoutExpirationInSeconds = 60;
            Int32.TryParse(WebConfigHelper.GetNoneExecutingWebConfigBy("Ajax-Timeout-Expiration-In-Seconds"), out ajaxTimeoutExpirationInSeconds);
            webClientConfigViewModel.AjaxTimeoutExpirationInSeconds = ajaxTimeoutExpirationInSeconds;

            bool showAngleAndDisplayID;
            bool.TryParse(WebConfigHelper.GetNoneExecutingWebConfigBy("ShowAngleAndDisplayID"), out showAngleAndDisplayID);
            webClientConfigViewModel.ShowAngleAndDisplayID = showAngleAndDisplayID;

            int maxNumberOfMassChangeItems = 1000;
            Int32.TryParse(WebConfigHelper.GetNoneExecutingWebConfigBy("MaxNumberOfMassChangeItems"), out maxNumberOfMassChangeItems);
            webClientConfigViewModel.MaxNumberOfMassChangeItems = maxNumberOfMassChangeItems;

            int maxNumberOfDashboard = 9;
            Int32.TryParse(WebConfigHelper.GetNoneExecutingWebConfigBy("MaxNumberOfDashboard"), out maxNumberOfDashboard);
            webClientConfigViewModel.MaxNumberOfDashboard = maxNumberOfDashboard;

            int dashboardRefreshIntervalTime = 15;
            Int32.TryParse(WebConfigHelper.GetNoneExecutingWebConfigBy("DashboardRefreshIntervalTime"), out dashboardRefreshIntervalTime);
            webClientConfigViewModel.DashboardRefreshIntervalTime = dashboardRefreshIntervalTime;
            
            string googleAnalyticsId = WebConfigHelper.GetNoneExecutingWebConfigBy("GoogleAnalyticsId");
            webClientConfigViewModel.GoogleAnalyticsId = googleAnalyticsId;
            
            bool.TryParse(WebConfigHelper.GetNoneExecutingWebConfigBy("EnableGoToSAP"), out bool enableGoToSAP);
            webClientConfigViewModel.EnableGoToSAP = enableGoToSAP;

            #endregion

            #region Trouble shooting

            bool showErrorSourceUri;
            bool.TryParse(WebConfigHelper.GetNoneExecutingWebConfigBy("ShowErrorSourceUri"), out showErrorSourceUri);
            webClientConfigViewModel.ShowErrorSourceUri = showErrorSourceUri;

            bool enableOptimizations;
            bool.TryParse(WebConfigHelper.GetNoneExecutingWebConfigBy("EnableOptimizations"), out enableOptimizations);
            webClientConfigViewModel.EnableOptimizations = enableOptimizations;

            int maxLogFileNumber = 9;
            int.TryParse(WebConfigHelper.GetNoneExecutingWebConfigBy("MaxLogFileNumber"), out maxLogFileNumber);
            webClientConfigViewModel.MaxLogFileNumber = maxLogFileNumber;

            int maxLogFileSize = 4193404;
            int.TryParse(WebConfigHelper.GetNoneExecutingWebConfigBy("MaxLogFileSize"), out maxLogFileSize);
            /* M4-13868: Modified unit of max file size from bytes to mega bytes */
            webClientConfigViewModel.MaxLogFileSize = maxLogFileSize / (1024 * 1024);

            #endregion

            return webClientConfigViewModel;

        }

        public bool SaveWebClientWebConfig(WebClientConfigViewModel newWebClientConfigViewMode)
        {
            bool isSaveSuccess = false;

            string overideFilePath = WebConfigHelper.GetWebClientFilePathBy("web.config");
            XmlDocument xmlDocument = new XmlDocument();
            xmlDocument.Load(overideFilePath);

            string MCWebConfigKeys = @"Ajax-Timeout-Expiration-In-Seconds|ShowAngleAndDisplayID|MaxNumberOfMassChangeItems|MaxNumberOfDashboard|ShowErrorSourceUri|EnableOptimizations|MaxLogFileNumber|MaxLogFileSize|DashboardRefreshIntervalTime|GoogleAnalyticsId|EnableGoToSAP";

            if (MCWebConfigKeys != "")
            {
                var newWebClientConfigViewModeProperties = newWebClientConfigViewMode.GetType().GetProperties();
                string[] webConfigKeys = MCWebConfigKeys.Split('|');
             
                foreach (string configKey in webConfigKeys)
                {
                 
                    var newWebClientConfig = newWebClientConfigViewModeProperties.FirstOrDefault(x => x.Name.ToLower().Equals(configKey.ToLower()));
                    string newAppSettingsValue = string.Empty;

                    if (newWebClientConfig != null)
                    {
                        newAppSettingsValue = newWebClientConfigViewMode.GetType().GetProperty(configKey).PropertyType == typeof(bool) ?
                                                                             newWebClientConfigViewMode.GetType().GetProperty(configKey).GetValue(newWebClientConfigViewMode).ToString().ToLower()
                                                                             : newWebClientConfigViewMode.GetType().GetProperty(configKey).GetValue(newWebClientConfigViewMode).ToString();

                        if (configKey == "MaxLogFileSize")
                        {
                            newAppSettingsValue = (int.Parse(newAppSettingsValue) * 1024 * 1024).ToString();
                        }

                        WebConfigHelper.UpdateAppSettingsValueToWebConfig(ref xmlDocument, configKey, newAppSettingsValue);
                    }
                    else
                    {
                        if (configKey == "Ajax-Timeout-Expiration-In-Seconds")
                        {
                            newAppSettingsValue = newWebClientConfigViewMode.GetType().GetProperty("AjaxTimeoutExpirationInSeconds").PropertyType == typeof(bool) ?
                                                                             newWebClientConfigViewMode.GetType().GetProperty("AjaxTimeoutExpirationInSeconds").GetValue(newWebClientConfigViewMode).ToString().ToLower()
                                                                             : newWebClientConfigViewMode.GetType().GetProperty("AjaxTimeoutExpirationInSeconds").GetValue(newWebClientConfigViewMode).ToString();
                            WebConfigHelper.UpdateAppSettingsValueToWebConfig(ref xmlDocument, configKey, newAppSettingsValue);
                        }
                    }

                }

                try
                {
                    xmlDocument.Save(overideFilePath);
                    isSaveSuccess = true;
                }
                catch (Exception ex)
                {
                    throw (ex);
                }
            }

            return isSaveSuccess;
        }
    }
}
