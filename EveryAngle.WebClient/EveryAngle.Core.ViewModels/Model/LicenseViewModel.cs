using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Globalization;

namespace EveryAngle.Core.ViewModels.Model
{
    public class SystemLicenseViewModel
    {
        [JsonProperty(PropertyName = "license_id")]
        public string license_id { get; set; }

        [JsonProperty(PropertyName = "license_type")]
        public string license_type { get; set; }

        [JsonProperty(PropertyName = "expires")]
        public long expires { get; set; }

        [JsonProperty(PropertyName = "expires_rfc1123")]
        public string expires_rfc1123 { get; set; }

        [JsonProperty(PropertyName = "file_description")]
        public FileDescriptionViewModel file_description { get; set; }

        [JsonProperty(PropertyName = "application_server_license")]
        public LicenseViewModel application_server_license { get; set; }

        [JsonProperty(PropertyName = "model_licenses")]
        public List<LicenseViewModel> model_licenses { get; set; }

        [JsonProperty(PropertyName = "license_signature")]
        public string license_signature { get; set; }

        [JsonProperty(PropertyName = "license")]
        public string license { get; set; }

       
    }

    public class FeatureViewModel
    {
        [JsonProperty(PropertyName = "feature")]
        public string feature { get; set; }

        [JsonProperty(PropertyName = "licensed")]
        public bool? licensed { get; set; }
    }

    public class FileDescriptionViewModel
    {
        [JsonProperty(PropertyName = "file_contents")]
        public string file_contents { get; set; }

        [JsonProperty(PropertyName = "created")]
        public long created { get; set; }

        [JsonProperty(PropertyName = "created_rfc1123")]
        public string created_rfc1123 { get; set; }

        [JsonProperty(PropertyName = "created_by")]
        public string created_by { get; set; }

        [JsonProperty(PropertyName = "created_machine")]
        public string created_machine { get; set; }
    }

    public class LicenseViewModel
    {
        [JsonProperty(PropertyName = "license_id")]
        public string license_id { get; set; }

        [JsonProperty(PropertyName = "license_type")]
        public string license_type { get; set; }

        [LocalizedDisplayName("MC_ExpirationDate")]
        [JsonProperty(PropertyName = "expires")]
        public long expires { get; set; }

        [JsonProperty(PropertyName = "expires_rfc1123")]
        public string expires_rfc1123 { get; set; }

        [JsonProperty(PropertyName = "organisation")]
        public OrganisationViewModel organisation { get; set; }

        [JsonProperty(PropertyName = "service_agreement")]
        public ServiceAgreementViewModel service_agreement { get; set; }

        [LocalizedDisplayName("MC_IPAddress")]
        [JsonProperty(PropertyName = "ip_addresses")]
        public List<string> ip_addresses { get; set; }

        public string ReanableIpAddresses
        {
            get
            {
                if (ip_addresses != null)
                {
                    return string.Join(", ", ip_addresses);
                }
                return string.Empty;
            }
        }

        [JsonProperty(PropertyName = "model_id")]
        public string model_id { get; set; }

        public string ModelName { get; set; }

        [LocalizedDisplayName("MC_NumberOfUsers")]
        [JsonProperty(PropertyName = "max_users")]
        public string max_users { get; set; }

        [LocalizedDisplayName("MC_NumberOfModelServers")]
        [JsonProperty(PropertyName = "max_modelservers")]
        public string max_modelservers { get; set; }

        [LocalizedDisplayName("MC_EFSRequired")]
        [JsonProperty(PropertyName = "EFS_Required")]
        public bool? EFS_Required { get; set; }
        
        [JsonProperty(PropertyName = "licensed_apps")]
        public List<string> licensed_apps { get; set; }

        [LocalizedDisplayName("MC_LicensedApps")]
        public string ReanableLicensedApps
        {
            get
            {
                if (licensed_apps != null)
                {
                    return string.Join(", ", licensed_apps);
                }
                return string.Empty;
            }
        }

        [LocalizedDisplayName("MC_NumberOfModels")]
        [JsonProperty(PropertyName = "max_models")]
        public string max_models { get; set; }

        [LocalizedDisplayName("MC_NumberOfUsers")]
        [JsonProperty(PropertyName = "max_named_users")]
        public string max_named_users { get; set; }

        [LocalizedDisplayName("MC_ConcurrentUsers")]
        [JsonProperty(PropertyName = "max_concurrent_users")]
        public string max_concurrent_users { get; set; }

        [JsonProperty(PropertyName = "system_status_emails")]
        public SystemStatusEmailsViewModel system_status_emails { get; set; }

        [JsonProperty(PropertyName = "license_signature")]
        public string license_signature { get; set; }

        [JsonProperty(PropertyName = "license")]
        public string license { get; set; }

        [JsonProperty(PropertyName = "features")]
        public List<FeatureViewModel> features { get; set; }

    }

    public class OrganisationViewModel
    {
        [JsonProperty(PropertyName = "id")]
        public string id { get; set; }

        [LocalizedDisplayName("MC_LicensedTo")]
        [JsonProperty(PropertyName = "name")]
        public string name { get; set; }

        [JsonProperty(PropertyName = "contact")]
        public string contact { get; set; }

        [JsonProperty(PropertyName = "address")]
        public string address { get; set; }

        [JsonProperty(PropertyName = "city")]
        public string city { get; set; }

        [JsonProperty(PropertyName = "country")]
        public string country { get; set; }

        [JsonProperty(PropertyName = "telephone")]
        public string telephone { get; set; }

        [JsonProperty(PropertyName = "email")]
        public string email { get; set; }
    }

    public class ServiceAgreementViewModel
    {
        [JsonProperty(PropertyName = "id")]
        public string id { get; set; }

        [JsonProperty(PropertyName = "description")]
        public string description { get; set; }
    }

    public class SystemStatusEmailsViewModel 
    {
        [JsonProperty(PropertyName = "mandatory_email_addresses")]
        public List<string> mandatory_email_addresses { get; set; }

        public string ReanableIpAddresses
        {
            get
            {
                if (mandatory_email_addresses != null)
                {
                    return string.Join(", ", mandatory_email_addresses);
                }
                return string.Empty;
            }
        }
    }
}
