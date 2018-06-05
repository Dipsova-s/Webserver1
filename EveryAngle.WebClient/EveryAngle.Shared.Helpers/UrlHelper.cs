using System;
using System.Configuration;
using System.Net;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Configuration;

namespace EveryAngle.Shared.Helpers
{
    public enum URLType
    {
        IWA = 0,
        HBA = 1,
        NOA = 2

    }

    public static class UrlHelper
    {
        private static bool IsValidUrl(string url)
        {
            Regex urlPattern = new Regex(@"^(ht|f)tp(s?)\:\/\/(([a-zA-Z0-9\-\._]+(\.[a-zA-Z0-9\-\._]+){2,}(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?)|localhost|([a-zA-Z0-9\-\._]+))$");
            return url != null && urlPattern.IsMatch(url);
        }

        private static bool IsValidPortNumber(string number)
        {
            Regex numberPattern = new Regex(@"\d+");
            return number != null && numberPattern.IsMatch(number);
        }

        private static string BuildUrl(URLType urlType)
        {
            string url = ConfigurationManager.AppSettings["WebServerBackendUrl"];
            string portNumber = ConfigurationManager.AppSettings["WebServiceBackendNOAPort"];
            if ((IsValidUrl(url)) && IsValidPortNumber(portNumber))
            {
                int noaPort = int.Parse(portNumber);

                url += ":{0}";

                switch (urlType)
                {
                    case URLType.IWA:
                        url = string.Format(url, noaPort + 1);
                        break;
                    case URLType.HBA:
                        url = string.Format(url, noaPort + 2);
                        break;
                    case URLType.NOA:
                        url = string.Format(url, noaPort);
                        break;
                    default:
                        break;
                }
                url += "/";
                return url;
            }
            else
            {
                throw new HttpException(HttpStatusCode.Conflict.GetHashCode(), "The configuration for 'Web Service Uri' or 'Port Number' is incorrect.");
            }
        }


        //Regarding to Bart: in that case, the hba port is noa + 2, iwaport = noa+1
        public static string GetRequestUrl(URLType urlType)
        {
            return BuildUrl(urlType);
        }

        public static bool IsValidFullUri()
        {
            bool result = false;

            string expectedUri = GetWebServerBackendUrl();
            if (HttpContext.Current.Request.Url.AbsoluteUri.ToLower().Contains(expectedUri))
            {
                result = true;
            }

            return result;
        }

        public static string GetCorrectedFullUri()
        {
            string uriPath = HttpContext.Current.Request.Url.PathAndQuery.ToLowerInvariant();
            string url = GetWebServerBackendUrl();

            return Convert.ToString(url + uriPath);
        }

        public static string GetLoginPath(bool forceToWC)
        {
            string redirectResult = string.Empty;
#if DEVMODE
            redirectResult = "~/security/index?redirect=/home/index";
#else
            string path = HttpContext.Current.Request.ApplicationPath.ToLower();
            redirectResult = path.Replace("/admin", "") + "/?redirect=" + (forceToWC ? path.Replace("/admin", "") : path);
#endif
            redirectResult = redirectResult.Replace("//", "/");
            return redirectResult;
        }
        public static string GetLoginPath()
        {
            return GetLoginPath(false);
        }

        public static string GetWebServerBackendUrl()
        {
            string appServerUrl = WebConfigurationManager.AppSettings["WebServerBackendUrl"];
            return appServerUrl.ToLowerInvariant();
        }
    }
}
