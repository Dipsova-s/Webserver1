using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;

namespace EveryAngle.Core.ViewModels.Model
{
    public class AgentViewModel
    {
        private Uri info_uri;
        [JsonProperty(PropertyName = "info_uri")]
        public virtual Uri Info
        {
            get { return info_uri; }
            set
            {
                info_uri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri languages_uri;
        [JsonProperty(PropertyName = "languages_uri")]
        public virtual Uri Languages
        {
            get { return languages_uri; }
            set
            {
                languages_uri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri scheduled_tasks_uri;
        [JsonProperty(PropertyName = "scheduled_tasks_uri")]
        public virtual Uri Scheduled
        {
            get { return scheduled_tasks_uri; }
            set
            {
                scheduled_tasks_uri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri modules_uri;
        [JsonProperty(PropertyName = "modules_uri")]
        public virtual Uri Modules
        {
            get { return modules_uri; }
            set
            {
                modules_uri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri download_settings_uri;
        [JsonProperty(PropertyName = "download_settings_uri")]
        public virtual Uri DownloadSettings
        {
            get { return download_settings_uri; }
            set
            {
                download_settings_uri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri modelserver_settings_uri;
        [JsonProperty(PropertyName = "modelserver_settings_uri")]
        public virtual Uri ModelserverSettings
        {
            get { return modelserver_settings_uri; }
            set
            {
                modelserver_settings_uri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri download_tables_uri;
        [JsonProperty(PropertyName = "downloadtables_uri")]
        public virtual Uri DownloadTables
        {
            get { return download_tables_uri; }
            set
            {
                download_tables_uri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri action_lists_uri;
        [JsonProperty(PropertyName = "action_lists_uri")]
        public virtual Uri ActionLists
        {
            get { return action_lists_uri; }
            set
            {
                action_lists_uri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri logfiles_uri;
        [JsonProperty(PropertyName = "logfiles_uri")]
        public virtual Uri LogfilesUri
        {
            get { return logfiles_uri; }
            set
            {
                logfiles_uri = value == null ? null : new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }


    }
}
