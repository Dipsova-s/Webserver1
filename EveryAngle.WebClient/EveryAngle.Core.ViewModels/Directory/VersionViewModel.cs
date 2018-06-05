using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Runtime.Serialization;

namespace EveryAngle.Core.ViewModels.Directory
{
    public class VersionViewModel
    {
        private Uri uri;
        [JsonProperty(PropertyName = "uri")]
        public Uri Uri
        {
            get { return uri; }
            set
            {
                uri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        [JsonProperty(PropertyName = "version")]
        public virtual string Version { get; set; }

        [JsonProperty(PropertyName = "is_latest")]
        public virtual bool IsLatest { get; set; }

        private Uri userUri;
        [JsonProperty(PropertyName = "user")]
        public Uri UserUri
        {
            get { return userUri; }
            set
            {
                userUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri sessionUri;
        [JsonProperty(PropertyName = "session")]
        public Uri SessionUri
        {
            get { return sessionUri; }
            set
            {
                sessionUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        [JsonProperty(PropertyName = "entries")]
        [LocalizedDisplayName("MC_Entries")]
        [DataMember]
        public List<Entry> Entries { get; set; }

        public Entry GetEntryByName(string name)
        {
            return this.Entries.Where(filter => filter.Name.Equals(name, StringComparison.InvariantCultureIgnoreCase)).SingleOrDefault();
        }

        public Entry GetEntryByEnum(VersionEntry versionEntryEnum)
        {
            return this.Entries.Where(filter => filter.Name.Equals(versionEntryEnum.ToString(), StringComparison.InvariantCultureIgnoreCase)).SingleOrDefault();
        }
    }

    public enum VersionEntry
    {
        about,
        angles,
        authentication_providers,
        business_processes,
        comments,
        dashboards,
        default_user_settings,
        eventlog,
        events,
        export_items,
        field_categories,
        internal_resources,
        item_exports,
        items,
        labelcategories,
        labels,
        model_servers,
        models,
        packages,
        results,
        session,
        sessions,
        system_currencies,
        system_datastore_plugins,
        system_datastores,
        system_information,
        system_languages,
        system_license,
        system_logs,
        system_roles,
        system_settings,
        tasks,
        users,
        versions,
        webclient_settings
    }
}
