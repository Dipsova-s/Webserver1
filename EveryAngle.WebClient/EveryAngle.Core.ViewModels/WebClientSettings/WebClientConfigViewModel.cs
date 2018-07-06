using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.Core.ViewModels.WebClientSettings
{
    public class WebClientConfigViewModel
    {
        #region General

        [Display(Name = "Use HTTPS")]
        public bool WebServiceBackendEnableSSL { get; set; }

        [Display(Name = "Ignore certificate errors")]
        public bool TrustAllCertificate { get; set; }

        [Display(Name = "Application server timeout")]
        public int AjaxTimeoutExpirationInSeconds { get; set; }

        [Display(Name = "Show item ID's")]
        public bool ShowAngleAndDisplayID { get; set; }

        [Display(Name = "Items in mass change")]
        public int MaxNumberOfMassChangeItems { get; set; }

        [Display(Name = "Angles on dashboard")]
        public int MaxNumberOfDashboard { get; set; }

        [Display(Name = "Dashboard refresh interval (minutes)")]
        public int DashboardRefreshIntervalTime { get; set; }

        [Display(Name = "Google Analytics ID")]
        public string GoogleAnalyticsId { get; set; }

        #endregion

        #region Trouble shooting

        [Display(Name = "Show uri in error popup")]
        public bool ShowErrorSourceUri { get; set; }

        [Display(Name = "Enable optimizations")]
        public bool EnableOptimizations { get; set; }

        [Display(Name = "Max logfiles")]
        public int MaxLogFileNumber { get; set; }

        [Display(Name = "Max size of logfile (MB)")]
        public int MaxLogFileSize { get; set; }

        #endregion

    }
}
