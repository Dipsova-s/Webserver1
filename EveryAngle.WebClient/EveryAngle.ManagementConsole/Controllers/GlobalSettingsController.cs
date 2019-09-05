using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Directory;
using EveryAngle.Core.ViewModels.EAPackage;
using EveryAngle.Core.ViewModels.Explorer;
using EveryAngle.Core.ViewModels.FieldCategory;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.SystemLanguages;
using EveryAngle.Core.ViewModels.SystemLog;
using EveryAngle.Core.ViewModels.SystemSettings;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.Core.ViewModels.WebClientSettings;
using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.ManagementConsole.Helpers.Controls;
using EveryAngle.ManagementConsole.Models;
using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Service;
using EveryAngle.WebClient.Service.HttpHandlers;
using EveryAngle.WebClient.Service.LogHandlers;
using EveryAngle.WebClient.Service.Security;
using Kendo.Mvc.UI;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net.Mime;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using UrlHelper = EveryAngle.Shared.Helpers.UrlHelper;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class GlobalSettingsController : BaseController
    {
        #region const variables
        private const string TEMP_LOG_PATH = "~\\bin\\Template\\Xslt";
        private const string CSL_EXPLORER = "CSFileExporter.exe";
        #endregion

        #region private variables
        // search patterns for WC amd MC log files
        private readonly Dictionary<SystemLogType, string[]> webLogFilters = new Dictionary<SystemLogType, string[]>
        {
            { SystemLogType.WebClient, WebConfigHelper.WebClientSearchPatterns },
            { SystemLogType.ManagementConsole, WebConfigHelper.ManagementConsoleSearchPatterns }
        };
        private DirectoryInfo logDirectory
        {
            get
            {
                string path;
#if DEVMODE
                path = "c:\\logs";
#else
                path = string.Format("{0}\\Data\\TempLog", AppDomain.CurrentDomain.BaseDirectory);
#endif

                DirectoryInfo directoryInfo = new DirectoryInfo(path);
                if (!directoryInfo.Exists)
                {
                    directoryInfo = Directory.CreateDirectory(directoryInfo.FullName);
                }
                return directoryInfo;
            }
        }
        
        private readonly IGlobalSettingService globalSettingService;
        private readonly IModelService modelService;
        private readonly IUserService userService;
        private readonly IWebClientConfigService webClientConfigService;
        #endregion

        public GlobalSettingsController(
            IGlobalSettingService globalSettingService, IModelService modelService,
            IUserService userService,
            IWebClientConfigService webClientConfigService)
        {
            this.modelService = modelService;
            this.globalSettingService = globalSettingService;
            this.userService = userService;
            this.webClientConfigService = webClientConfigService;
            SessionHelper = SessionHelper.Initialize();
        }

        public ActionResult GetSystemSettings()
        {
            var version = SessionHelper.Version;
            var systemSettingModel = globalSettingService.GetSystemSettings(version.GetEntryByName("system_settings").Uri.ToString());

            ViewBag.DefaultProvider = systemSettingModel.DefaultAuthenticationProvider;
            return PartialView("~/Views/GlobalSettings/SystemSettings/SystemSettings.cshtml", systemSettingModel);
        }

        public ActionResult GetWebClientSettings()
        {
            var webClientConfigViewModel = webClientConfigService.GetWebClientWebConfig();
            var webClientConfigViewModelApplyOverride =
                webClientConfigService.ApplyOverrideToWebClientConfigViewModel(webClientConfigViewModel);
            return PartialView("~/Views/GlobalSettings/WebClientSettings/WebClientSettings.cshtml",
                webClientConfigViewModelApplyOverride);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public void SaveAuthentication(string systemSettingsData, string authenticationProviderData)
        {
            var version = SessionHelper.Version;
            var SystemSettings = JsonConvert.DeserializeObject<SystemSettingViewModel>(systemSettingsData);
            var updatedSystemSettings = (SystemSettingViewModel)SessionHelper.SystemSettings.Clone();

            //Update Authentication Provider on Grid
            var existProviders = userService.GetSystemAuthenticationProviders(version.GetEntryByName("authentication_providers").Uri.ToString());
            var updateSystemAuthenticationProvider = JsonConvert.DeserializeObject<List<SystemAuthenticationProviderViewModel>>(authenticationProviderData);

            updateSystemAuthenticationProvider.ForEach(provider =>
            {
                var existProviderItem = existProviders.FirstOrDefault(s => s.Uri.ToString() == provider.Uri.AbsolutePath.TrimStart('/'));

                existProviderItem.IsEnabled = provider.IsEnabled;
                if (SystemSettings.DefaultAuthenticationProvider.Contains(provider.Uri.ToString()))
                {
                    existProviderItem.IsEnabled = true;
                }

                userService.UpdateAuthentication(provider.Uri.AbsolutePath.TrimStart('/').ToString(),
                    JsonConvert.SerializeObject(existProviderItem, new JsonSerializerSettings
                    {
                        ContractResolver =
                            new CleanUpPropertiesResolver(new List<string>
                            {
                                "id",
                                "uri",
                                "type",
                                "sync_roles_to_groups",
                                "users",
                                "user_groups",
                                "mandatory_groups"
                            })
                    }));
            });


            //Update System Setting
            updatedSystemSettings.DefaultAuthenticationProvider = SystemSettings.DefaultAuthenticationProvider;
            updatedSystemSettings.trusted_webservers = SystemSettings.trusted_webservers;
            var savedSystemSettings = globalSettingService.UpdateSystemSetting(version.GetEntryByName("system_settings").Uri.ToString(),
                                        JsonConvert.SerializeObject(updatedSystemSettings, new JsonSerializerSettings
                                        {
                                            ContractResolver = new CleanUpPropertiesResolver(new List<string> { "remote_certificates" })
                                        }));

            SessionHelper.ReloadSystemSetting(savedSystemSettings);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult SaveSystemSettings(string systemSettingsData, string recipient)
        {
            var sessionHelper = SessionHelper;
            var version = sessionHelper.Version;
            var systemSettings = JsonConvert.DeserializeObject<SystemSettingViewModel>(systemSettingsData);
            var updatedSystemSettings = (SystemSettingViewModel)sessionHelper.SystemSettings.Clone();
            updatedSystemSettings.session_expiry_minutes = systemSettings.session_expiry_minutes;
            updatedSystemSettings.modelserver_check_seconds = systemSettings.modelserver_check_seconds;
            updatedSystemSettings.default_cache_minutes = systemSettings.default_cache_minutes;
            updatedSystemSettings.min_labelcategories_to_publish = systemSettings.min_labelcategories_to_publish;
            updatedSystemSettings.check_expired_sessions_minutes = systemSettings.check_expired_sessions_minutes;
            updatedSystemSettings.instances_per_model = systemSettings.instances_per_model;
            updatedSystemSettings.auto_create_users = systemSettings.auto_create_users;
            updatedSystemSettings.default_system_roles = systemSettings.default_system_roles;
            updatedSystemSettings.default_pagesize = systemSettings.default_pagesize;
            updatedSystemSettings.max_pagesize = systemSettings.max_pagesize;
            updatedSystemSettings.remember_expired_sessions_minutes = systemSettings.remember_expired_sessions_minutes;
            updatedSystemSettings.modelserver_timeout = systemSettings.modelserver_timeout;
            updatedSystemSettings.modelserver_metadata_timeout = systemSettings.modelserver_metadata_timeout;
            updatedSystemSettings.max_domainelements_for_search = systemSettings.max_domainelements_for_search;
            updatedSystemSettings.active_directory_size_limit = systemSettings.active_directory_size_limit;
            updatedSystemSettings.default_max_export_page_size = systemSettings.default_max_export_page_size;
            updatedSystemSettings.max_event_log_stored_records = systemSettings.max_event_log_stored_records;
            updatedSystemSettings.max_audit_log_history = systemSettings.max_audit_log_history;
            updatedSystemSettings.allow_grouping_in_pivot_excel_export = systemSettings.allow_grouping_in_pivot_excel_export;
            updatedSystemSettings.include_self_in_export_headers = systemSettings.include_self_in_export_headers;

            updatedSystemSettings.EmailSettings.smtp_server = systemSettings.EmailSettings.smtp_server;
            updatedSystemSettings.EmailSettings.smtp_port = systemSettings.EmailSettings.smtp_port;
            updatedSystemSettings.EmailSettings.smtp_sender = systemSettings.EmailSettings.smtp_sender;
            updatedSystemSettings.EmailSettings.smtp_use_ssl = systemSettings.EmailSettings.smtp_use_ssl;
            updatedSystemSettings.EmailSettings.username = systemSettings.EmailSettings.username;
            updatedSystemSettings.EmailSettings.password = systemSettings.EmailSettings.password;

            var savedSystemSettings =
                globalSettingService.UpdateSystemSetting(version.GetEntryByName("system_settings").Uri.ToString(),
                    JsonConvert.SerializeObject(updatedSystemSettings, new JsonSerializerSettings
                    {
                        ContractResolver =
                            new CleanUpPropertiesResolver(new List<string>
                            {
                                "default_authentication_provider",
                                "max_pagesize"
                            })
                    }));

            sessionHelper.ReloadSystemSetting(savedSystemSettings);

            if (!string.IsNullOrEmpty(recipient))
            {
                return new ContentResult
                {
                    Content =
                        globalSettingService.TestEmailSettings(
                            version.GetEntryByName("system_settings").Uri + "?mode=checksmtp", recipient),
                    ContentType = "text/html"
                };
            }

            return new ContentResult
            {
                Content = JsonConvert.SerializeObject(savedSystemSettings),
                ContentType = "application/json"
            };
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public void SaveWebClientSettings(string webClientSettingsData)
        {
            var webClientConfigViewModel = JsonConvert.DeserializeObject<WebClientConfigViewModel>(webClientSettingsData);
            webClientConfigService.SaveWebClientWebConfig(webClientConfigViewModel);
        }

        private void LoadSystemRolesToSessionAndViewBag(VersionViewModel version = null, SystemSettingViewModel systemSettingModel = null)
        {
            if (version == null)
                version = SessionHelper.Version;

            if (systemSettingModel == null)
                systemSettingModel = SessionHelper.SystemSettings;

            string uriSystemRoles = string.Format("{0}?{1}", version.GetEntryByName("system_roles").Uri
                                                           , UtilitiesHelper.GetOffsetLimitQueryString(1, systemSettingModel.max_pagesize));

            var result = RequestManager.Initialize(uriSystemRoles).Run();

            var systemRoles = JsonConvert.DeserializeObject<IEnumerable<SystemRoleViewModel>>(result.SelectToken("roles").ToString());

            ViewBag.SystemRoles = systemRoles
                                    .OrderBy(x => x.Id)
                                    .Select(role =>
                                        new AssignedRoleViewModel()
                                        {
                                            RoleId = role.Id,
                                            ModelId = role.ModelPrivilege != null && role.ModelPrivilege.model_id != null
                                                      ? role.ModelPrivilege.model_id
                                                      : null
                                        }).ToList();
        }

        public ActionResult GetAuthentication()
        {
            var version = SessionHelper.Version;
            var systemSettingModel = SessionHelper.SystemSettings;
            var providers = new List<SystemAuthenticationProviderViewModel>();

            var authenticationProviderTypes = new List<AuthenticationProviderTypesViewModel>();
            var uriList = new List<string>();
            var uriGetSystemAuthenticationProviders = version.GetEntryByName("authentication_providers").Uri.ToString();
            uriGetSystemAuthenticationProviders = string.Format("{0}?{1}", uriGetSystemAuthenticationProviders
                                                                         , UtilitiesHelper.GetOffsetLimitQueryString(1, systemSettingModel.max_pagesize));
            uriList.Add(uriGetSystemAuthenticationProviders);
            LoadSystemRolesToSessionAndViewBag(version, systemSettingModel);
            uriList.Add("/system/authenticationprovider_types/");

            var taskIndex = 0;
            UrlHelperExtension.ParallelRequest(uriList).ForEach(delegate(Task<JObject> task)
            {
                if (taskIndex == 0)
                {
                    providers =
                        JsonConvert.DeserializeObject<List<SystemAuthenticationProviderViewModel>>(
                            task.Result.SelectToken("authentication_providers").ToString());
                }
                else
                {
                    authenticationProviderTypes = JsonConvert.DeserializeObject<List<AuthenticationProviderTypesViewModel>>(
                            task.Result.SelectToken("authentication_provider_types").ToString());
                }
                taskIndex++;
            });

            ViewData["AuthenticationProvider"] = providers;
            ViewBag.DefaultProvider = systemSettingModel.DefaultAuthenticationProvider;
            ViewBag.AuthenticationProviderTypes = authenticationProviderTypes;
            return PartialView("~/Views/GlobalSettings/Authentication/AuthenticationPage.cshtml", systemSettingModel);
        }

        public ActionResult EditAuthentication(string authenticationProviderUri, string AuthenticationProviderTypesUri)
        {
            AuthenticationProviderTypesViewModel authenticationProviderTypes;

            var systemAuthenticationProvider = new SystemAuthenticationProviderViewModel();
            if (authenticationProviderUri == "")
            {
                var jsonResult = RequestManager.Initialize(AuthenticationProviderTypesUri).Run();
                authenticationProviderTypes = JsonConvert.DeserializeObject<AuthenticationProviderTypesViewModel>(
                            jsonResult.ToString());
                systemAuthenticationProvider = new SystemAuthenticationProviderViewModel();

                if (authenticationProviderTypes.Id == "AD")
                {
                    systemAuthenticationProvider.IsEnabled = true;
                    systemAuthenticationProvider.autoCreateUsers = false;
                }
                else
                {
                    systemAuthenticationProvider.IsEnabled = true;
                    systemAuthenticationProvider.autoCreateUsers = true;
                }
            }
            else
            {
                var jsonResult = RequestManager.Initialize(authenticationProviderUri).Run();
                systemAuthenticationProvider = JsonConvert.DeserializeObject<SystemAuthenticationProviderViewModel>(jsonResult.ToString());

                jsonResult = RequestManager.Initialize("/system/authenticationprovider_types").Run();
                var authenticationProviderTypesList = JsonConvert.DeserializeObject<IEnumerable<AuthenticationProviderTypesViewModel>>(
                            jsonResult.SelectToken("authentication_provider_types").ToString());

                authenticationProviderTypes = authenticationProviderTypesList.FirstOrDefault(x => x.Id == systemAuthenticationProvider.Type);
            }
            LoadSystemRolesToSessionAndViewBag();
            ViewBag.AuthenticationProviderTypes = authenticationProviderTypes;
            ViewBag.SystemAuthenticationProvider = systemAuthenticationProvider;
            return PartialView("~/Views/GlobalSettings/Authentication/EditAuthentication.cshtml", systemAuthenticationProvider);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public void SaveAuthenticationProvider(bool isNewAuthenticationProvider, string authenticationProviderData, string updateAuthenticationProviderUri)
        {
            RestSharp.Method method;
            string url = "";
            if (isNewAuthenticationProvider)
            {
                method = RestSharp.Method.POST;
                url = "/system/authenticationproviders";
            }
            else
            {
                method = RestSharp.Method.PUT;
                url = updateAuthenticationProviderUri;
            }
            RequestManager.Initialize(url).Run(method, authenticationProviderData);
        }

        [AcceptVerbs(HttpVerbs.Delete)]
        public void DeleteAuthenticationProvider(string authenticationProviderUri)
        {
            RequestManager.Initialize(authenticationProviderUri).Run(RestSharp.Method.DELETE);
        }

        public ActionResult GetSystemRoles()
        {
            var version = SessionHelper.Version;
            List<SystemRoleViewModel> systemRoles;
            var systemrolesEntry = version.GetEntryByName("system_roles");
            if (systemrolesEntry == null)
            {
                systemRoles = new List<SystemRoleViewModel>();
            }
            else
            {
                systemRoles =
                    modelService.GetSystemRoles(systemrolesEntry.Uri + "?" +
                                                UtilitiesHelper.GetOffsetLimitQueryString(1, MaxPageSize));
            }
            var subRoles = systemRoles.Select(selector => selector.Id).ToList();
            return Json(subRoles, JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetGlobalLanguages()
        {
            ViewData["UnableLanguages"] = GetLanguages(false).Data.OrderBy(lang => lang.Name).ToList();
            return PartialView("~/Views/GlobalSettings/Languages/LanguagesSetting.cshtml");
        }

        private List<SystemLanguageViewModel> SortSystemLanguages(ListViewModel<SystemLanguageViewModel> systemInfoModel)
        {
            var defaultLanguage = systemInfoModel.Data.Where(f => f.Id.Equals("en")).ToList();
            var languages = systemInfoModel.Data.Except(defaultLanguage).OrderBy(lang => lang.Name).ToList();
            var sortLanguages = defaultLanguage.Union(languages).ToList();
            return sortLanguages;
        }

        public ListViewModel<SystemLanguageViewModel> GetLanguages(bool enabled)
        {
            VersionViewModel version = SessionHelper.Version;
            string uri = version.GetEntryByName("system_languages").Uri + "?caching=false&" + OffsetLimitQuery;
            ListViewModel<SystemLanguageViewModel> systemLanguages = globalSettingService.GetSystemLanguages(uri);
            systemLanguages.Data = systemLanguages.Data.Where(lang => lang.Enabled == enabled).ToList();
            systemLanguages.Header.Total = systemLanguages.Data.Count;
            return systemLanguages;
        }

        public ActionResult ReadGlobalLanguages([DataSourceRequest] DataSourceRequest request)
        {
            var systemLanguagesModel = GetLanguages(false);
            var sortLanguages = SortSystemLanguages(GetLanguages(true));
            ViewData["UnableLanguages"] = systemLanguagesModel.Data;

            var total = sortLanguages.Count;
            var result = new DataSourceResult
            {
                Data = sortLanguages,
                Total = total
            };
            return Json(result);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult SaveGlobalLanguages(string languagesData)
        {
            var languages = JsonConvert.DeserializeObject<List<SystemLanguageViewModel>>(languagesData);
            var removedData = new List<string>();
            var un_removeData = new Dictionary<string, string>();

            foreach (var language in languages)
            {
                var existLanguage = globalSettingService.GetSystemLanguage(language.Uri.ToString());
                var updatedLanguage = (SystemLanguageViewModel)existLanguage.Clone();
                updatedLanguage.Enabled = language.Enabled;
                try
                {
                    globalSettingService.UpdateLanguage(language.Uri.ToString(),
                        JsonConvert.SerializeObject(updatedLanguage, new JsonSerializerSettings
                        {
                            ContractResolver =
                                new UpdatedPropertiesResolver<SystemLanguageViewModel>(updatedLanguage, existLanguage)
                        }));
                    if (updatedLanguage.Enabled == false)
                    {
                        removedData.Add(language.Name);
                    }
                }
                catch (HttpException ex)
                {
                    dynamic errorResult = JsonConvert.DeserializeObject(ex.Message);
                    string message = errorResult.message;
                    if (updatedLanguage.Enabled == false)
                    {
                        un_removeData.Add(language.Name, message);
                    }
                }
            }

            return new JsonResult
            {
                Data = new { removedData, un_removeData },
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public void DeleteLanguage(string languageUri)
        {
            var Language = globalSettingService.GetSystemLanguage(languageUri);
            Language.Enabled = false;

            globalSettingService.UpdateLanguage(languageUri, JsonConvert.SerializeObject(Language));
        }

        public ActionResult GetWelcomePage()
        {
            var version = SessionHelper.Version;
            var webClientSetting =
                globalSettingService.GetWebClientSettings(version.GetEntryByName("webclient_settings").Uri +
                                                          "?multilingual=yes");
            var systemLanguages = GetLanguages(true).Data;
            var languagesList = new List<Tuple<string, string, int>>();
            foreach (var systemLanguage in systemLanguages)
            {
                languagesList.Add(Tuple.Create(systemLanguage.Id, systemLanguage.Name, systemLanguage.Id == "en" ? 0 : 1));
            }

            ViewData["EnabledLanguages"] = languagesList.OrderBy(lang => lang.Item3).ToList();

            if (!string.IsNullOrEmpty(webClientSetting.companylogo) &&
                webClientSetting.companylogo != "http://www.yahoo.com/" &&
                webClientSetting.companylogo != "http://www.everyangle.com/")
            {
                ViewBag.CompanyLogo = webClientSetting.companylogo;
            }
            else
            {
                ViewBag.CompanyLogo = "";
            }

            // check videos which are missing thumbnail
            string rootPath = UtilitiesHelper.GetWebClientPath();
            string videoPath = rootPath + @"resources\movies\";
            List<string> videosList = VideoHelper.GetVideosNoThumbnailFromDirectory(videoPath, true);
            int loop;
            int loopCount = videosList.Count;
            for (loop = 0; loop < loopCount; loop++)
            {
                videosList[loop] = UtilitiesHelper.GetWebClientUrl(videosList[loop].Substring(rootPath.Length).Replace("\\", "/"));
            }
            ViewData["VideosNoThumbnail"] = videosList;

            return PartialView("~/Views/GlobalSettings/WelcomePage/WelcomePage.cshtml", webClientSetting);
        }

        [ValidateInput(false)]
        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult SaveWelcomePage(FormCollection formCollection, HttpPostedFileBase file)
        {
            try
            {
                var version = SessionHelper.Version;
                var existWebClientSetting =
                    globalSettingService.GetWebClientSettings(version.GetEntryByName("webclient_settings").Uri +
                                                              "?multilingual=yes");
                var updateWebClientSetting = (WebClientSettingViewModel)existWebClientSetting.Clone();
                var webClientSetting =
                    JsonConvert.DeserializeObject<WebClientSettingViewModel>(formCollection["WebclientsettingsData"]);

                updateWebClientSetting.introductiontexts = webClientSetting.introductiontexts;
                updateWebClientSetting.newstexts = webClientSetting.newstexts;
                updateWebClientSetting.movielinktitles = webClientSetting.movielinktitles;
                updateWebClientSetting.movielinkurl = webClientSetting.movielinkurl;

                var uriRoot = HttpContext.Request.Url.GetLeftPart(UriPartial.Authority) + Url.Content("~/");
                if (file != null && file.ContentLength > 0)
                {
                    var folderPath = "~/UploadedResources/CompanyLogo/";
                    ImageHelper.RenameUploadLogo(file, "logo_EN", folderPath);
                    updateWebClientSetting.companylogo =
                        string.Format(uriRoot + "/UploadedResources/CompanyLogo/" + "logo_EN.png");
                }
                else
                {
                    updateWebClientSetting.companylogo = existWebClientSetting.companylogo;
                }

                globalSettingService.UpdateWebClientSetting(
                    version.GetEntryByName("webclient_settings").Uri + "?multilingual=yes",
                    JsonConvert.SerializeObject(updateWebClientSetting, new JsonSerializerSettings
                    {
                        ContractResolver = new CleanUpPropertiesResolver(null)
                    }));

                return JsonHelper.GetJsonStringResult(true, null,
                    null, MessageType.SUCCESS_UPDATED, null);
            }
            catch (HttpException ex)
            {
                return JsonHelper.GetJsonStringResult(false, ex.GetHttpCode(), ex.Message,
                    MessageType.DEFAULT, null);
            }
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public void SaveVideoThumbnail(string dataImage, string pathVideo)
        {
            var bytes = Convert.FromBase64String(dataImage.Replace(" ", "+"));
            using (var ms = new MemoryStream(bytes))
            {
                var imageFile = string.Empty;
#if DEVMODE
                imageFile = VideoHelper.GetImageFileFromVideoFile(UtilitiesHelper.GetWebClientPath() + pathVideo);
#else

                string path = Server.MapPath("/"); 
                imageFile = path.Replace("\\\\", "") + pathVideo.Replace("/", "\\");
                imageFile = VideoHelper.GetImageFileFromVideoFile(imageFile);
                imageFile = imageFile.Replace("/", "\\");
             
#endif
                using (Image image = Image.FromStream(ms))
                {
                    image.Save(imageFile);
                }
            }
        }

        public ActionResult RenderUploadedEASetsPage()
        {
            ViewBag.HasManageModel = SessionHelper.Session.IsValidToManageModelPrivilege();
            return PartialView("~/Views/GlobalSettings/UploadEASets/AllUploadedEASets.cshtml");
        }

        public ActionResult RenderExportPackageForm()
        {
            IEnumerable<ExportPackageModelViewModel> ExportPackageModelViewModel = SessionHelper.Models.Select(x => new ExportPackageModelViewModel
            {
                Id = x.id,
                Name = x.short_name,
                HasManageModelPrivilege = SessionHelper.Session.IsValidToManageModelPrivilege(x.Uri.ToString())
            });

            return PartialView("~/Views/GlobalSettings/UploadEASets/ExportPackageForm.cshtml", ExportPackageModelViewModel);
        }

        public ActionResult GetFilterUploadedEASets(string q = "")
        {
            ViewData["DefaultPageSize"] = DefaultPageSize;
            ViewBag.Query = q;
            return PartialView("~/Views/GlobalSettings/UploadEASets/AllUploadedEASetsGrid.cshtml");
        }

        private ListViewModel<PackageViewModel> GetPackages(int page, int pagesize, string query,
            [DataSourceRequest] DataSourceRequest request)
        {
            var version = SessionHelper.Version;
            var models = SessionHelper.Models;
            var packagesUri = version.GetEntryByName("packages").Uri + "?" +
                              UtilitiesHelper.GetOffsetLimitQueryString(page, pagesize, query);
            if (request != null)
            {
                packagesUri += PageHelper.GetPackagesQueryString(request);
            }

            var packages = globalSettingService.GetPackages(packagesUri);
            packages.Data.ForEach(packageData =>
            {
                var modelsName = new List<string>();
                packageData.activated_models.ForEach(activatedModel =>
                {
                    var model = models.FirstOrDefault(w => w.id == activatedModel);
                    modelsName.Add(model != null ? model.short_name : activatedModel);
                });
                packageData.ActivatedModels = string.Join(", ", modelsName);
            });
            return packages;
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ReadPackages([DataSourceRequest] DataSourceRequest request, string q)
        {
            var packages = GetPackages(request.Page, request.PageSize, q, request);
            var result = new DataSourceResult
            {
                Data = packages.Data,
                Total = packages.Header.Total
            };
            return Json(result);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult UploadPackage(FormCollection formCollection, HttpPostedFileBase file)
        {
            try
            {
                if (file.ContentLength > 0)
                {
                    var package = PackageHelper.Parse(file.FileName);
                    if (package.IsValid())
                    {
                        var version = SessionHelper.Version;
                        var uri = version.GetEntryByName("packages").Uri.ToString();

                        var zipFile = new byte[file.ContentLength];
                        file.InputStream.Read(zipFile, 0, zipFile.Length);
                        globalSettingService.CreatePackage(uri, zipFile, file.FileName, file.ContentType);
                        return JsonHelper.GetJsonStringResult(true, null,
                            null, MessageType.DEFAULT, null);
                    }
                    return JsonHelper.GetJsonStringResult(false, null,
                        package.ErrorMessage, MessageType.DEFAULT, null);
                }
                return JsonHelper.GetJsonStringResult(false, null,
                    null, MessageType.REQUIRE_PACKAGE, null);
            }
            catch (HttpException ex)
            {
                HttpContext.Response.AddHeader("Content-Type", "text/html; charset=utf-8");
                HttpContext.Response.AddHeader("X-Requested-With", "XMLHttpRequest");

                var error = ex.Message;
                if (ex.Source != "EveryAngle.WebClient.Service" || error == "")
                {
                    return JsonHelper.GetJsonStringResult(false, ex.GetHttpCode(), null,
                        MessageType.DEFAULT, null);
                }
                return JsonHelper.GetJsonStringResult(false, ex.GetHttpCode(), error,
                    MessageType.DEFAULT, null);
            }
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public void DeletePackage(string packageUri)
        {
            globalSettingService.DeletePackage(packageUri);
        }

        private static List<FieldCategoryViewModel> SortFields(ListViewModel<FieldCategoryViewModel> fieldCategories)
        {
            var specificFields =
                fieldCategories.Data.Where(f => f.id.Equals("EA") || f.id.Equals("SAP") || f.id.Equals("Reference") || f.id.Equals("GRC"))
                    .ToList();
            var fields = fieldCategories.Data.Except(specificFields).ToList();
            var sortfieldCategory = specificFields.Union(fields).ToList();
            return sortfieldCategory;
        }

        public ActionResult AllFieldCategory()
        {
            var fieldCategories = GetFieldCategories(1, MaxPageSize);
            ViewData["Total"] = fieldCategories.Header.Total;

            var sortfieldCategory = SortFields(fieldCategories);
            return PartialView("~/Views/GlobalSettings/Fieldcategories/FieldCategories.cshtml",
                sortfieldCategory.ToList());
        }

        private ListViewModel<FieldCategoryViewModel> GetFieldCategories(int page, int pagesize)
        {
            var version = SessionHelper.Version;
            var fieldCategoryUri = version.GetEntryByName("field_categories").Uri + "?" +
                                   UtilitiesHelper.GetOffsetLimitQueryString(page, pagesize);
            var fieldCategories = globalSettingService.GetFieldCategories(fieldCategoryUri);
            return fieldCategories;
        }


        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult SaveFieldCategory(FormCollection formCollection, IEnumerable<HttpPostedFileBase> files,
            string deleteData)
        {
            var fieldCategories = JsonConvert.DeserializeObject<List<FieldCategoryViewModel>>(deleteData);
            var removedData = new List<string>();
            var un_removeData = new Dictionary<string, string>();
            if (fieldCategories != null)
            {
                foreach (var fieldCategory in fieldCategories)
                {
                    try
                    {
                        globalSettingService.DeleteFieldCategory(fieldCategory.uri.PathAndQuery.Remove(0, 1));
                        removedData.Add(fieldCategory.short_name);
                    }
                    catch (HttpException ex)
                    {
                        dynamic errorResult = JsonConvert.DeserializeObject(ex.Message);
                        string message = errorResult.message;
                        un_removeData.Add(fieldCategory.short_name, message);
                    }
                }
            }

            var parameters = new JsonResult { Data = new { removedData, un_removeData } };

            try
            {
                if (!string.IsNullOrEmpty(formCollection["updatedFields"]))
                {
                    var version = SessionHelper.Version;
                    var fieldCategory =
                        globalSettingService.GetFieldCategories(
                            version.GetEntryByName("field_categories").Uri.ToString());
                    var ItemUploadFolderPath = "~/UploadedResources/FieldCategoryIcons/";
                    var fieldsUri = Regex.Split(formCollection["updatedFields"], "#,#");
                    for (var index = 0; index < fieldsUri.Length; index++)
                    {
                        var fieldUri = fieldsUri[index];
                        if (fieldUri != "#,#" && fieldUri != string.Empty)
                        {
                            var editedIndex = Convert.ToInt32(fieldUri.Substring(0, fieldUri.IndexOf(":")));
                            var uri =
                                fieldUri.Substring(fieldUri.IndexOf(":") + 1,
                                    fieldUri.Length - fieldUri.IndexOf(":") - 1).Replace("'", "");
                            FieldCategoryViewModel fieldModel = null;
                            if (!string.IsNullOrEmpty(uri))
                            {
                                var updateFieldModel =
                                    fieldCategory.Data.FirstOrDefault(filter => filter.uri.ToString() == uri);
                                if (updateFieldModel != null)
                                {
                                    updateFieldModel.short_name = Regex.Split(formCollection["editId"], ",")[index];
                                    updateFieldModel.long_name = updateFieldModel.short_name;
                                    fieldModel = globalSettingService.UpdateFieldCategory(uri,
                                        JsonConvert.SerializeObject(updateFieldModel,
                                            new JsonSerializerSettings
                                            {
                                                ContractResolver =
                                                    new CleanUpPropertiesResolver(new List<string> { "uri" })
                                            }));
                                }
                            }
                            else
                            {
                                fieldModel = new FieldCategoryViewModel();
                                if (formCollection["editId"] != null)
                                {
                                    fieldModel.id = Regex.Split(formCollection["editId"], ",")[index];
                                    fieldModel.short_name = fieldModel.id;
                                    fieldModel.long_name = fieldModel.id;
                                    fieldModel =
                                        globalSettingService.CreateFieldCategory(
                                            version.GetEntryByName("field_categories").Uri.ToString(),
                                            JsonConvert.SerializeObject(fieldModel));
                                }
                            }

                            if (fieldModel != null)
                            {
                                var uploadedFiles = GetFileIndexFromFileUploadList(editedIndex, ref files);
                                string finalFileName;
                                for (var uploadIndex = 0; uploadIndex < uploadedFiles.Count; uploadIndex++)
                                {
                                    if (uploadedFiles[uploadIndex] != null)
                                    {
                                        if (uploadIndex == 0)
                                        {
                                            finalFileName = fieldModel.id + "_" + "16";
                                            ImageHelper.RenameUploadFile(uploadedFiles[uploadIndex], finalFileName,
                                                ItemUploadFolderPath, 16);
                                        }
                                        else
                                        {
                                            finalFileName = fieldModel.id + "_" + "32";
                                            ImageHelper.RenameUploadFile(uploadedFiles[uploadIndex], finalFileName,
                                                ItemUploadFolderPath, 32);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                return JsonHelper.GetJsonStringResult(true, null, null, MessageType.DEFAULT,
                    parameters);
            }
            catch (HttpException ex)
            {
                HttpContext.Response.AddHeader("Content-Type", "text/html; charset=utf-8");
                HttpContext.Response.AddHeader("X-Requested-With", "XMLHttpRequest");

                var error = ex.Message;
                if (ex.Source != "EveryAngle.WebClient.Service")
                {
                    return JsonHelper.GetJsonStringResult(true, null, error,
                        MessageType.DEFAULT, parameters);
                }
                return JsonHelper.GetJsonStringResult(false, ex.GetHttpCode(),
                    error.Substring(1), MessageType.DEFAULT, parameters);
            }
        }

        private List<HttpPostedFileBase> GetFileIndexFromFileUploadList(int editedIndex,
            ref IEnumerable<HttpPostedFileBase> files)
        {
            var editFiles = new List<HttpPostedFileBase>();

            var startIndexOfFileUpload = editedIndex * 2;
            editFiles.Add(files.ElementAtOrDefault(startIndexOfFileUpload));
            editFiles.Add(files.ElementAtOrDefault(startIndexOfFileUpload + 1));
            return editFiles;
        }

        /*System log*/

        public ActionResult SystemLog(string target, string modelId, string category)
        {
            List<ModelViewModel> models = SessionHelper.Models.Where(x => x.id != "EAModelHANA").ToList();
            SystemLogType logType = GetSystemLogType(target);

            bool isModelServerLog = logType == SystemLogType.ModelServer;
            bool isWebClientLog = logType == SystemLogType.WebClient || logType == SystemLogType.ManagementConsole;

            ViewBag.LogTarget = target;
            ViewBag.ModelId = modelId;
            ViewBag.Category = category;
            ViewBag.DefaultPageSize = DefaultPageSize;
            ViewBag.ScrollVirtual = true;

            // enable/disable viewer in top level
            // FileModel.SupportViewer will handle in each items
            ViewBag.EnableLogViewer = !isWebClientLog;

            // model server log does not support sorting
            ViewBag.SortEnabled = !isModelServerLog;

            ViewBag.ServerOperation = true;
            ViewData["ModelsData"] = models;

            // get log categories for ModelServer log
            JArray mdelServicesData = new JArray();
            if (isModelServerLog)
            {
                foreach (var modelItem in models)
                {
                    string modelServicesUri = string.Format("{0}/logfiles", modelItem.Agent);
                    JObject modelServicesResult = UrlHelperExtension.GetRestClientManager(modelServicesUri);
                    modelServicesResult.Add("ModelId", modelItem.id);
                    mdelServicesData.Add(modelServicesResult);
                }
            }
            ViewData["ModelServicesData"] = JsonConvert.SerializeObject(mdelServicesData);

            return PartialView("~/Views/GlobalSettings/SystemLog/SystemLog.cshtml");
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public JsonResult ReadAllFolders([DataSourceRequest] DataSourceRequest request,
            string target,
            string modelUri,
            string modelService)
        {
            int total = 0;

            IList<FileModel> files = new List<FileModel>();
            SystemLogType logType = GetSystemLogType(target);

            if (logType == SystemLogType.WebClient
                || logType == SystemLogType.ManagementConsole)
            {
                files = GetClientLog(request, logType, ref total);
            }
            else if (logType == SystemLogType.AppServer)
            {
                files = GetAppServerLog(request, ref total);
            }
            else if (logType == SystemLogType.ModelServer)
            {
                files = GetModelServerLog(request, modelService, modelUri, ref total);
                
                return Json(new MSLogDataSourceResult
                {
                    Data = files,
                    Total = total,
                    Totalwarning = 0,
                    TotalError = 0
                });
            }

            return Json(new DataSourceResult
            {
                Data = files,
                Total = total
            });
        }

        private List<FileModel> GetClientLog(DataSourceRequest request, SystemLogType logType, ref int total)
        {
            string logFileFolder = LogManager.GetLogPath(ConfigurationManager.AppSettings.Get("LogFileFolder"));
            string[] searchPatterns = webLogFilters[logType];
            List<FileModel> files = FileModel.GetFiles(logFileFolder, searchPatterns);
            int skip = request.PageSize * (request.Page - 1);

            // sort default by Modified Desc
            string sortBy = "Modified";
            ListSortDirection sortDirection = ListSortDirection.Descending;
            if (request.Sorts != null && request.Sorts.Count != 0)
            {
                sortBy = request.Sorts[0].Member;
                sortDirection = request.Sorts[0].SortDirection;
            }

            if (sortDirection == ListSortDirection.Ascending)
            {
                switch (sortBy)
                {
                    case "Name":
                        files = files.OrderBy(order => order.Name).ToList();
                        break;
                    case "Size":
                        files = files.OrderBy(order => order.Size).ToList();
                        break;
                    default:
                        files = files.OrderBy(order => order.Modified).ToList();
                        break;
                }
            }
            else
            {
                switch (sortBy)
                {
                    case "Name":
                        files = files.OrderByDescending(order => order.Name).ToList();
                        break;
                    case "Size":
                        files = files.OrderByDescending(order => order.Size).ToList();
                        break;
                    default:
                        files = files.OrderByDescending(order => order.Modified).ToList();
                        break;
                }
            }

            // result
            total = files.Count;
            files = files.Skip(skip).Take(request.PageSize).ToList();

            return files;
        }

        private List<FileModel> GetAppServerLog(DataSourceRequest request, ref int total)
        {
            List<FileModel> files = new List<FileModel>();

            #region sorting

            Dictionary<string, string> sortMappers = new Dictionary<string, string>
            {
                {  "Modified", "&sort=modified" },
                {  "Name", "&sort=file" },
                {  "Size", "&sort=size" }
            };
            string sortByDefault = "Modified";
            string sortBy = sortByDefault;
            ListSortDirection sortDirection = ListSortDirection.Descending;
            if (request.Sorts != null && request.Sorts.Count > 0)
            {
                sortBy = request.Sorts[0].Member;
                sortDirection = request.Sorts[0].SortDirection;
            }

            string sortOption = string.Empty;
            if (sortDirection == ListSortDirection.Ascending)
                sortOption += "&dir=asc";
            else
                sortOption += "&dir=desc";

            if (sortMappers.ContainsKey(sortBy))
                sortOption += sortMappers[sortBy];
            else
                sortOption += sortMappers[sortByDefault];

            #endregion

            // TODO: refactor - move to service, create viewmodel
            string requestUrl = string.Format("{0}?{1}{2}",
                                    SessionHelper.Version.GetEntryByName("system_logs").Uri,
                                    UtilitiesHelper.GetOffsetLimitQueryString(request.Page, request.PageSize),
                                    sortOption);
            RequestManager requestManager = RequestManager.Initialize(requestUrl);
            JObject jsonResult = requestManager.Run();

            dynamic header = JsonConvert.DeserializeObject<dynamic>(jsonResult.SelectToken("header").ToString());
            dynamic logfiles = JsonConvert.DeserializeObject<dynamic>(jsonResult.SelectToken("logfiles").ToString());

            // total
            total = header.total;

            // files
            foreach (var jsonLogFile in logfiles.Children())
            {
                files.Add(new FileModel(jsonLogFile, string.Empty));
            }
            return files;
        }

        private List<FileModel> GetModelServerLog(DataSourceRequest request, string modelServiceId, string modelUri, ref int total)
        {
            List<FileModel> files = new List<FileModel>();

            if (!string.IsNullOrEmpty(modelServiceId) && !string.IsNullOrEmpty(modelUri))
            {
                var model = SessionHelper.GetModel(modelUri);
                var agentViewModel = this.modelService.GetModelAgent(model.Agent.ToString());
                if (agentViewModel.LogfilesUri != null)
                {
                    // TODO: refactor - move to service, create viewmodel
                    string requestUrl = string.Format("{0}?id={1}&{2}",
                                            agentViewModel.LogfilesUri,
                                            modelServiceId,
                                            UtilitiesHelper.GetOffsetLimitQueryString(request.Page, request.PageSize));
                    RequestManager requestManager = RequestManager.Initialize(requestUrl);
                    JObject jsonResult = requestManager.Run();

                    dynamic header = JsonConvert.DeserializeObject<dynamic>(jsonResult.SelectToken("header").ToString());
                    dynamic logfiles = JsonConvert.DeserializeObject<dynamic>(jsonResult.SelectToken("logfiles").ToString());

                    // total
                    total = header.total;

                    // files
                    foreach (var jsonLogFile in logfiles.Children())
                    {
                        files.Add(new FileModel(jsonLogFile, model.Agent.AbsolutePath));
                    }
                }
            }

            return files;
        }

        public ContentResult GetSystemlog(
            string fullPath,
            int? offset,
            int? limit,
            string q = "",
            string type = "",
            string target = "")
        {
            SystemLogType logType = GetSystemLogType(target);
            if (logType == SystemLogType.AppServer || logType == SystemLogType.ModelServer)
            {
                DownloadAndCreateLogFile(ref fullPath);
            }
            else
            {
                var fileInfo = new FileInfo(fullPath);
                fullPath = Path.Combine(logDirectory.FullName, fileInfo.Name);
                System.IO.File.Copy(fileInfo.FullName, fullPath, true);
            }

            ExecuteParameters para = new ExecuteParameters
            {
                Parameters = "-x " + fullPath,
                CommandPath = Path.Combine(Server.MapPath(TEMP_LOG_PATH), CSL_EXPLORER),
                ExecutePath = fullPath,
                Uri = Url.Action("GetSystemlogByDetailsUri", "GlobalSettings"),
                Q = q,
                MessageType = type
            };

            if (!offset.HasValue)
            {
                para.Offset = 0;
            }
            else
            {
                para.Offset = offset.Value;
            }

            if (!limit.HasValue)
            {
                para.Limit = DefaultPageSize;
            }
            else
            {
                para.Limit = limit.Value;
            }

            var executeResult = UtilitiesHelper.GetJsonFromCsl(para);

            if (executeResult.Success)
            {
                return new ContentResult { Content = executeResult.Content.ToString(), ContentType = "application/json" };
            }

            throw new HttpException(422, JsonConvert.SerializeObject(new
            {
                reason = executeResult.ErrorMessage,
                message = para.ExecutePath
            }));
        }

        public ContentResult GetSystemlogByDetailsUri(
            string fullPath,
            string detailUri,
            string q = "",
            string type = "")
        {
            var filename = Path.GetFileName(fullPath);
            fullPath = Path.Combine(logDirectory.FullName, filename);

            if (!Path.HasExtension(fullPath))
            {
                fullPath = fullPath + ".csl";
            }

            var para = new ExecuteParameters();
            para.Parameters = "-x " + fullPath;
            para.CommandPath = Path.Combine(Server.MapPath(TEMP_LOG_PATH), "CSFileExporter.exe");
            para.ExecutePath = fullPath;
            para.DetailsId = detailUri.Split('/').Last();
            para.Q = q;
            para.MessageType = type;

            var executeResult = UtilitiesHelper.GetDetailFromCsl(para);
            return Content(executeResult.StringContent);
        }

        [AcceptVerbs(HttpVerbs.Delete)]
        public void DeleteSystemLogXML()
        {
            var fullPath = logDirectory.FullName;
            var listXML = Directory.GetFiles(fullPath, "*.xml", SearchOption.AllDirectories);
            foreach (var fileXML in listXML)
            {
                System.IO.File.Delete(fileXML);
            }
        }

        public FileResult GetSystemlogFile(string fullPath, string target = "")
        {
            SystemLogType logType = GetSystemLogType(target);
            string logFile = Base64Helper.Decode(fullPath);
            string fileName;
            byte[] fileBytes;
            if (logType == SystemLogType.AppServer || logType == SystemLogType.ModelServer)
            {
                string contentDisposition = string.Empty;
                string requestUrl = UrlHelper.GetRequestUrl(URLType.NOA) + logFile;
                RequestManager requestManager = RequestManager.Initialize(requestUrl);
                fileBytes = requestManager.GetBinary(ref contentDisposition);
                fileName = requestManager.GetFileDownloadName(contentDisposition);
            }
            else
            {
                FileInfo fileInfo = new FileInfo(logFile);
                fileBytes = System.IO.File.ReadAllBytes(logFile);
                fileName = fileInfo.Name;
            }
            return File(fileBytes, MediaTypeNames.Application.Octet, fileName);
        }

        private void DownloadAndCreateLogFile(ref string fullPath)
        {
            string requestUrl = UrlHelper.GetRequestUrl(URLType.NOA) + fullPath;
            var filename = Path.GetFileName(Uri.UnescapeDataString(requestUrl).Replace("/", "\\"));
            fullPath = Path.Combine(logDirectory.FullName, filename);

            if (!System.IO.File.Exists(fullPath))
            {
                var requestManager = RequestManager.Initialize(requestUrl);
                var downloadFileByte = requestManager.GetBinary();

                if (!Path.HasExtension(fullPath))
                {
                    fullPath = fullPath + ".csl";
                }

                System.IO.File.WriteAllBytes(fullPath, downloadFileByte);
            }
        }

        public ActionResult AllEventLog(string target)
        {
            ViewBag.DefaultPageSize = DefaultPageSize;
            var version = SessionHelper.Version;
            ViewBag.EventLogUri = version.GetEntryByName("eventlog").Uri.ToString();
            return PartialView("~/Views/GlobalSettings/EventLogs/AllEventLogs.cshtml");
        }

        public ActionResult ReadEventLogs([DataSourceRequest] DataSourceRequest request, string eventLogUri)
        {
            var alltasksHistory =
                modelService.GetTaskHistories(eventLogUri + "?filtermode=task_results&" +
                                              UtilitiesHelper.GetOffsetLimitQueryString(request.Page, request.PageSize));
            var result = new DataSourceResult
            {
                Data = alltasksHistory.Data,
                Total = alltasksHistory.Header.Total
            };
            return Json(result);
        }

        private SystemLogType GetSystemLogType(string target)
        {
            Enum.TryParse(target, out SystemLogType logType);
            return logType;
        }

        /*End of System log*/
    }
}
