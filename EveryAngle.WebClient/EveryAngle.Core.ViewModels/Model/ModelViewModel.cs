using EveryAngle.Core.ViewModels.Users;
using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace EveryAngle.Core.ViewModels.Model
{
    public class ModelViewModel : ICloneable
    {

        public string id { get; set; }

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

        [LocalizedDisplayName("LicenseType")]
        [JsonProperty(PropertyName = "licensed_apps")]
        public List<string> licensed_apps { get; set; }

        [LocalizedDisplayName("LicenseType")]
        public string LicensedType
        {
            get
            {
                return licensed_apps != null && licensed_apps.Count > 0 ? string.Join(",", licensed_apps) : "";
            }
        }

        public string short_name { get; set; }

        public string long_name { get; set; }

        public string abbreviation { get; set; }

        public string latest_instance { get; set; }

        private Uri _current_instance;
        [JsonProperty(PropertyName = "current_instance")]
        public Uri current_instance
        {
            get { return _current_instance; }
            set
            {
                _current_instance = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri _suggested_fields_summary;
        [JsonProperty(PropertyName = "suggested_fields_summary")]
        public Uri suggested_fields_summary
        {
            get { return _suggested_fields_summary; }
            set
            {
                _suggested_fields_summary = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri _angle_warnings_summary;
        [JsonProperty(PropertyName = "angle_warnings_summary")]
        public Uri angle_warnings_summary
        {
            get { return _angle_warnings_summary; }
            set
            {
                _angle_warnings_summary = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        public string userModelPriveledge { get; set; }

        public bool manageModelPrivilege { get; set; }

        public string agent_uri { get; set; }

        private Uri _labels;
        public virtual Uri labels
        {
            get { return _labels; }
            set
            {
                _labels = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri labelCategoriesUri;
        public virtual Uri label_categories
        {
            get { return labelCategoriesUri; }
            set
            {
                labelCategoriesUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri classesUri;
        [JsonProperty(PropertyName = "classes")]

        public Uri ClassesUri
        {
            get { return classesUri; }
            set
            {
                classesUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri followupsUri;
        [JsonProperty(PropertyName = "followups")]

        public Uri FollowupsUri
        {
            get { return followupsUri; }
            set
            {
                followupsUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri fieldsUri;
        [JsonProperty(PropertyName = "fields")]

        public virtual Uri FieldsUri
        {
            get { return fieldsUri; }
            set
            {
                fieldsUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri fieldsourcesUri;
        [JsonProperty(PropertyName = "fieldsources")]

        public virtual Uri FieldsourcesUri
        {
            get { return fieldsourcesUri; }
            set
            {
                fieldsourcesUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri packagesUri;
        [JsonProperty(PropertyName = "packages")]
        public Uri PackagesUri
        {
            get { return packagesUri; }
            set
            {
                packagesUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri modelRolesUri;
        [JsonProperty(PropertyName = "model_roles")]
        public Uri ModelRolesUri
        {
            get { return modelRolesUri; }
            set
            {
                modelRolesUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        private Uri serverUri;
        [JsonProperty(PropertyName = "servers")]
        public Uri ServerUri
        {
            get { return serverUri; }
            set
            {
                serverUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }


        [LocalizedDisplayName("MC_License")]
        public List<string> licence_labels { get; set; }

        [LocalizedDisplayName("MC_Environment")]
        public string environment { get; set; }


        public List<string> active_languages { get; set; }


        [DefaultValue(0)]
        public string authorized_users { get; set; }

        private Uri licenseUri;
        [JsonProperty(PropertyName = "license")]
        public Uri LicenseUri
        {
            get { return licenseUri; }
            set
            {
                licenseUri = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        [JsonProperty(PropertyName = "created", DefaultValueHandling = DefaultValueHandling.Ignore)]
        [LocalizedDisplayName("MC_Created")]
        [DataMember]
        public UserDateViewModel CreatedBy { get; set; }

        [LocalizedDisplayName("MC_Version")]
        [JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Version { get; set; }

        private Uri agent;
        [JsonProperty(PropertyName = "agent")]
        public Uri Agent
        {
            get { return agent; }
            set
            {
                agent = new Uri(UrlHelper.GetRequestUrl(URLType.NOA) + value);
            }
        }

        [JsonProperty(PropertyName = "model_status")]
        public string model_status { get; set; }

        [JsonProperty(PropertyName = "type")]
        public string modelType { get; set; }

        [JsonProperty(PropertyName = "company_information")]
        public CompanyInformationViewModel CompanyInformation { get; set; }

        [JsonProperty(PropertyName = "email_settings")]
        public EmailSettingsViewModel EmailSettings { get; set; }

        public object Clone()
        {
            return this.MemberwiseClone();
        }

        public int connected_users { get; set; }

        public long active_this_week { get; set; }

        public long active_this_month { get; set; }

        [JsonProperty(PropertyName = "switch_when_postprocessing")]
        public bool? SwitchWhenPostprocessing { get; set; }

        [JsonProperty(PropertyName = "is_postprocessing")]
        public bool? IsProcessing { get; set; }

    }

    public class CompanyInformationViewModel
    {

        [LocalizedDisplayName("MC_Contact")]
        [JsonProperty(PropertyName = "contact")]
        public string contact { get; set; }

        [LocalizedDisplayName("MC_Address")]
        [JsonProperty(PropertyName = "address")]
        public string address { get; set; }

        [LocalizedDisplayName("MC_City")]
        [JsonProperty(PropertyName = "city")]
        public string city { get; set; }

        [LocalizedDisplayName("MC_Country")]
        [JsonProperty(PropertyName = "country")]
        public string country { get; set; }

        [LocalizedDisplayName("MC_TelephoneNumber")]
        [JsonProperty(PropertyName = "telephone")]
        public string telephone { get; set; }

        [LocalizedDisplayName("MC_EmailAddress")]
        [JsonProperty(PropertyName = "email")]
        public string email { get; set; }
    }

    public class EmailSettingsViewModel
    {

        [JsonProperty(PropertyName = "smtp_server")]
        [LocalizedDisplayName("MC_EmailServerSMTP")]
        public string smtp_server { get; set; }

        [LocalizedDisplayName("MC_SenderEmailaccount")]
        [JsonProperty(PropertyName = "sender")]
        public string sender { get; set; }

        [LocalizedDisplayName("Username")]
        [JsonProperty(PropertyName = "username")]
        public string username { get; set; }

        [LocalizedDisplayName("Password")]
        [JsonProperty(PropertyName = "password")]
        public string password { get; set; }

        [LocalizedDisplayName("MC_MessageRecipients")]
        [JsonProperty(PropertyName = "recipients")]
        public List<string> recipients { get; set; }

        [LocalizedDisplayName("MC_SendLogFrequencyInHours")]
        [JsonProperty(PropertyName = "send_logs_frequency")]
        public int send_system_logs_frequency_hours { get; set; }

        public string ReOrderrecipients
        {
            get
            {
                if (recipients != null)
                {
                    return string.Join(", ", recipients);
                }
                return string.Empty;
            }

        }

        [LocalizedDisplayName("MC_AttachLogfiles")]
        [JsonProperty(PropertyName = "attach_logfiles")]
        public bool? attach_logfiles { get; set; }

    }
}
