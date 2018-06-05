using System;
using System.Collections.Generic;
using System.IO;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.BusinessProcesses;
using EveryAngle.Core.ViewModels.Cycle;
using EveryAngle.Core.ViewModels.EAPackage;
using EveryAngle.Core.ViewModels.FieldCategory;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.SystemCurrencies;
using EveryAngle.Core.ViewModels.SystemLanguages;
using EveryAngle.Core.ViewModels.SystemSettings;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.Utilities;
using EveryAngle.WebClient.Service.HttpHandlers;
using Newtonsoft.Json;
using RestSharp;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class GlobalSettingService : IGlobalSettingService
    {
        public SystemSettingViewModel GetSystemSettings(string systemSettingsUri)
        {
            var requestManager = RequestManager.Initialize(systemSettingsUri);
            var jsonResult = requestManager.Run();
            var systemSettings = JsonConvert.DeserializeObject<SystemSettingViewModel>(jsonResult.ToString());

            // assign new max page size
            systemSettings.max_pagesize_appserver = systemSettings.max_pagesize;
            systemSettings.max_pagesize = Convert.ToInt32(System.Configuration.ConfigurationManager.AppSettings["LargePageSize"].ToString());

            return systemSettings;
        }

        public SystemSettingViewModel UpdateSystemSetting(string systemSettingUri, string systemSettingData)
        {
            var requestManager = RequestManager.Initialize(systemSettingUri);
            var jsonResult = requestManager.Run(Method.PUT,systemSettingData);
            var result = JsonConvert.DeserializeObject<SystemSettingViewModel>(jsonResult.ToString());
            return result;
        }

        public string TestEmailSettings(string uri, string data)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run(Method.PUT,data);
            return jsonResult.ToString();
        }

        public ListViewModel<SystemRoleViewModel> GetSystemRoles(string systemRoleUri)
        {
            var requestManager = RequestManager.Initialize(systemRoleUri);
            var jsonResult = requestManager.Run();
            var result = new ListViewModel<SystemRoleViewModel>();
            result.Data =
                JsonConvert.DeserializeObject<List<SystemRoleViewModel>>(jsonResult.SelectToken("roles").ToString());
            result.Header = JsonConvert.DeserializeObject<HeaderViewModel>(jsonResult.SelectToken("header").ToString());
            return result;
        }

        public SystemRoleViewModel GetSystemRole(string systemRoleUri)
        {
            var requestManager = RequestManager.Initialize(systemRoleUri);
            var jsonResult = requestManager.Run();
            var result = JsonConvert.DeserializeObject<SystemRoleViewModel>(jsonResult.ToString());
            return result;
        }

        public void UpdateSystemRole(string systemRoleUri, string systemRoleData)
        {
            var requestManager = RequestManager.Initialize(systemRoleUri);
            requestManager.Run(Method.PUT,systemRoleData);
        }

        public ListViewModel<SystemLanguageViewModel> GetSystemLanguages(string languageSystemUri)
        {
            var requestManager = RequestManager.Initialize(languageSystemUri);
            var jsonResult = requestManager.Run();
            var result = new ListViewModel<SystemLanguageViewModel>();
            result.Data =
                JsonConvert.DeserializeObject<List<SystemLanguageViewModel>>(
                    jsonResult.SelectToken("languages").ToString());
            result.Header = JsonConvert.DeserializeObject<HeaderViewModel>(jsonResult.SelectToken("header").ToString());
            return result;
        }

        public SystemLanguageViewModel GetSystemLanguage(string languageUri)
        {
            var requestManager = RequestManager.Initialize(languageUri);
            var jsonResult = requestManager.Run();
            var result = JsonConvert.DeserializeObject<SystemLanguageViewModel>(jsonResult.ToString());
            return result;
        }


        public SystemLanguageViewModel UpdateLanguage(string languageUri, string updatelanguage)
        {
            var requestManager = RequestManager.Initialize(languageUri);
            var jsonResult = requestManager.Run(Method.PUT,updatelanguage);
            var result = JsonConvert.DeserializeObject<SystemLanguageViewModel>(jsonResult.ToString());
            return result;
        }

        public BusinessProcessViewModel GetBusinessProcess(string labelUri)
        {
            var requestManager = RequestManager.Initialize(labelUri);
            var jsonResult = requestManager.Run();
            var result = JsonConvert.DeserializeObject<BusinessProcessViewModel>(jsonResult.ToString());
            return result;
        }

        public List<BusinessProcessViewModel> GetBusinessProcesses(string businessProcessUri)
        {
            var requestManager = RequestManager.Initialize(businessProcessUri);
            var jsonResult = requestManager.Run();
            var result =
                JsonConvert.DeserializeObject<List<BusinessProcessViewModel>>(
                    jsonResult.SelectToken("business_processes").ToString());
            return result;
        }


        public BusinessProcessViewModel UpdateLabel(string labelCategoryUri, string updatedLabel)
        {
            var requestManager = RequestManager.Initialize(labelCategoryUri);
            var jsonResult = requestManager.Run(Method.PUT,updatedLabel);
            var result = JsonConvert.DeserializeObject<BusinessProcessViewModel>(jsonResult.ToString());
            return result;
        }


        public BusinessProcessViewModel UpdateNewLabel(string labelCategoryUri, string updatedLabel)
        {
            var requestManager = RequestManager.Initialize(labelCategoryUri);
            var jsonResult = requestManager.Run(Method.POST,updatedLabel);
            var result = JsonConvert.DeserializeObject<BusinessProcessViewModel>(jsonResult.ToString());
            return result;
        }

        public void DeleteBusinessProcessLabel(string labelUri)
        {
            var requestManager = RequestManager.Initialize(labelUri);
            requestManager.Run(Method.DELETE);
        }

        public WebClientSettingViewModel GetWebClientSettings(string webClientSettingUri)
        {
            var requestManager = RequestManager.Initialize(webClientSettingUri);
            var jsonResult = requestManager.Run();
            var result = JsonConvert.DeserializeObject<WebClientSettingViewModel>(jsonResult.ToString());
            return result;
        }

        public void UpdateWebClientSetting(string webClientSettingUri, string webClientSettingData)
        {
            var requestManager = RequestManager.Initialize(webClientSettingUri);
            requestManager.Run(Method.PUT,webClientSettingData);
        }

        public ListViewModel<PackageViewModel> GetPackages(string packageUri)
        {
            var requestManager = RequestManager.Initialize(packageUri);
            var jsonResult = requestManager.Run();
            var packages = new ListViewModel<PackageViewModel>();
            packages.Data =
                JsonConvert.DeserializeObject<List<PackageViewModel>>(jsonResult.SelectToken("packages").ToString(),
                    new UnixDateTimeConverter());
            packages.Header = JsonConvert.DeserializeObject<HeaderViewModel>(jsonResult.SelectToken("header").ToString());
            return packages;
        }

        public ListViewModel<FieldCategoryViewModel> GetFieldCategories(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            var fieldCategories = new ListViewModel<FieldCategoryViewModel>();
            fieldCategories.Data =
                JsonConvert.DeserializeObject<List<FieldCategoryViewModel>>(
                    jsonResult.SelectToken("field_categories").ToString());
            fieldCategories.Header =
                JsonConvert.DeserializeObject<HeaderViewModel>(jsonResult.SelectToken("header").ToString());
            return fieldCategories;
        }

        public FieldCategoryViewModel UpdateFieldCategory(string uri, string updateFieldCategory)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run(Method.PUT,updateFieldCategory);
            var result = JsonConvert.DeserializeObject<FieldCategoryViewModel>(jsonResult.ToString());
            return result;
        }

        public void DeleteFieldCategory(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            requestManager.Run(Method.DELETE);
        }

        public FieldCategoryViewModel CreateFieldCategory(string uri, string createFieldCategory)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run(Method.POST,createFieldCategory);
            var result = JsonConvert.DeserializeObject<FieldCategoryViewModel>(jsonResult.ToString());
            return result;
        }

        public void CreatePackage(string uri, byte[] packageFile, string fileName, string fileType)
        {
            var requestManager = RequestManager.Initialize(uri + "?name=" + fileName);
            requestManager.PostBinary(packageFile, fileName);
        }

        public void DeletePackage(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            requestManager.Run(Method.DELETE);
        }

        public SystemLicenseViewModel GetLicense(string licenseUri)
        {
            var requestManager = RequestManager.Initialize(licenseUri);
            var jsonResult = requestManager.Run();
            var modelLicense = JsonConvert.DeserializeObject<SystemLicenseViewModel>(jsonResult.ToString());
            return modelLicense;
        }

        public void UpdateLicense(string licenseUri, string licenseData)
        {
            var requestManager = RequestManager.Initialize(licenseUri);
            requestManager.Run(Method.PUT,licenseData);
        }


        public ListViewModel<TaskHistoryViewModel> GetEventLogs(string packageUri)
        {
            var requestManager = RequestManager.Initialize(packageUri);
            var jsonResult = requestManager.Run();
            var packages = new ListViewModel<TaskHistoryViewModel>();
            packages.Data =
                JsonConvert.DeserializeObject<List<TaskHistoryViewModel>>(jsonResult.SelectToken("event_log").ToString());
            packages.Header = JsonConvert.DeserializeObject<HeaderViewModel>(jsonResult.SelectToken("header").ToString());
            return packages;
        }

        public List<CurrenciesViewModel> GetSystemCurrencies(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            var currencies =
                JsonConvert.DeserializeObject<List<CurrenciesViewModel>>(jsonResult.SelectToken("currencies").ToString());
            return currencies;
        }

        public byte[] ReadToEnd(Stream stream)
        {
            var originalPosition = stream.Position;
            stream.Position = 0;

            try
            {
                var readBuffer = new byte[4096];

                var totalBytesRead = 0;
                int bytesRead;

                while ((bytesRead = stream.Read(readBuffer, totalBytesRead, readBuffer.Length - totalBytesRead)) > 0)
                {
                    totalBytesRead += bytesRead;

                    if (totalBytesRead == readBuffer.Length)
                    {
                        var nextByte = stream.ReadByte();
                        if (nextByte != -1)
                        {
                            var temp = new byte[readBuffer.Length*2];
                            Buffer.BlockCopy(readBuffer, 0, temp, 0, readBuffer.Length);
                            Buffer.SetByte(temp, totalBytesRead, (byte) nextByte);
                            readBuffer = temp;
                            totalBytesRead++;
                        }
                    }
                }

                var buffer = readBuffer;
                if (readBuffer.Length != totalBytesRead)
                {
                    buffer = new byte[totalBytesRead];
                    Buffer.BlockCopy(readBuffer, 0, buffer, 0, totalBytesRead);
                }
                return buffer;
            }
            finally
            {
                stream.Position = originalPosition;
            }
        }
    }
}
