using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Label;
using EveryAngle.Core.ViewModels.LabelCategory;
using EveryAngle.Core.ViewModels.SystemInformation;
using EveryAngle.Core.ViewModels.SystemLanguages;
using EveryAngle.Shared.Helpers;
using EveryAngle.WebClient.Service.HttpHandlers;
using Newtonsoft.Json;
using RestSharp;
using EveryAngle.WebClient.Service.Security;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class LabelService : ILabelService
    {
        public List<SystemLanguageViewModel> GetSystemLanguages()
        {
            var version = SessionHelper.Initialize().Version;
            var systemSettings = SessionHelper.Initialize().SystemSettings;
            var globalSettingService = new GlobalSettingService();
            var systemLanguages =
                globalSettingService.GetSystemLanguages(version.GetEntryByName("system_languages").Uri +
                                                        "?enabled=true&" +
                                                        UtilitiesHelper.GetOffsetLimitQueryString(1,
                                                            systemSettings.max_pagesize));
            return systemLanguages.Data;
        }

        //public ListViewModel<LabelCategoryViewModel> GetLabelCategoriesExceptBusinessProcess(string uri)
        //{
        //    var requestManager = RequestManager.Initialize(uri, false);
        //    JObject jsonResult = requestManager.Run();
        //    ListViewModel<LabelCategoryViewModel> result = new ListViewModel<LabelCategoryViewModel>();

        //    result.Data = JsonConvert.DeserializeObject<List<LabelCategoryViewModel>>(jsonResult.SelectToken("label_categories").ToString()).Where(x => x.contains_businessprocesses != true).ToList();
        //    result.Header = JsonConvert.DeserializeObject<HeaderViewModel>(jsonResult.SelectToken("header").ToString());
        //    result.Header.Total = result.Data.Count();
        //    return result;
        //}

        public ListViewModel<LabelCategoryViewModel> GetLabelCategories(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            var result = new ListViewModel<LabelCategoryViewModel>();
            result.Data =
                JsonConvert.DeserializeObject<List<LabelCategoryViewModel>>(
                    jsonResult.SelectToken("label_categories").ToString());
            result.Header = JsonConvert.DeserializeObject<HeaderViewModel>(jsonResult.SelectToken("header").ToString());
            return result;
        }

        public LabelCategoryViewModel GetLabelCategory(string labelUri)
        {
            var requestManager = RequestManager.Initialize(labelUri);
            var jsonResult = requestManager.Run();
            return JsonConvert.DeserializeObject<LabelCategoryViewModel>(jsonResult.ToString());
        }

        public void DeleteLabelCategory(string labelUri)
        {
            var requestManager = RequestManager.Initialize(labelUri);
            requestManager.Run(Method.DELETE);
        }

        public LabelViewModel GetLabel(string labelUri)
        {
            var requestManager = RequestManager.Initialize(labelUri);
            var jsonResult = requestManager.Run();
            return JsonConvert.DeserializeObject<LabelViewModel>(jsonResult.ToString());
        }

        public ListViewModel<LabelViewModel> GetLabels(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            var token = jsonResult.SelectToken("labels");

            var label = new ListViewModel<LabelViewModel>();


            if (token == null)
            {
                label.Data =
                    JsonConvert.DeserializeObject<List<LabelViewModel>>(
                        jsonResult.SelectToken("business_processes").ToString());
            }
            else
            {
                label.Data =
                    JsonConvert.DeserializeObject<List<LabelViewModel>>(jsonResult.SelectToken("labels").ToString());
            }

            label.Header = JsonConvert.DeserializeObject<HeaderViewModel>(jsonResult.SelectToken("header").ToString());
            return label;
        }


        public LabelViewModel CreateLabel(string labelCategoryUri, string newLabel)
        {
            var requestManager = RequestManager.Initialize(labelCategoryUri);
            var jsonResult = requestManager.Run(Method.POST,newLabel);
            return JsonConvert.DeserializeObject<LabelViewModel>(jsonResult.ToString());
        }

        public LabelViewModel UpdateLabel(string labelCategoryUri, string updatedLabel)
        {
            var requestManager = RequestManager.Initialize(labelCategoryUri);
            var jsonResult = requestManager.Run(Method.PUT,updatedLabel);
            return JsonConvert.DeserializeObject<LabelViewModel>(jsonResult.ToString());
        }


        public LabelViewModel UpdateNewLabel(string labelCategoryUri, string updatedLabel)
        {
            var requestManager = RequestManager.Initialize(labelCategoryUri);
            var jsonResult = requestManager.Run(Method.POST,updatedLabel);
            return JsonConvert.DeserializeObject<LabelViewModel>(jsonResult.ToString());
        }

        public LabelCategoryViewModel UpdateNewCategoryLabel(string ModelUri, string updatedLabel)
        {
            var requestManager = RequestManager.Initialize(ModelUri);
            var jsonResult = requestManager.Run(Method.POST,updatedLabel);
            return JsonConvert.DeserializeObject<LabelCategoryViewModel>(jsonResult.ToString());
        }

        public LabelCategoryViewModel UpdateLabelCategory(string labelCategoryUri, string updatedLabel)
        {
            var requestManager = RequestManager.Initialize(labelCategoryUri);
            var jsonResult = requestManager.Run(Method.PUT,updatedLabel);
            return JsonConvert.DeserializeObject<LabelCategoryViewModel>(jsonResult.ToString());
        }

        public void DeleteLabel(string labelUri)
        {
            var requestManager = RequestManager.Initialize(labelUri);
            requestManager.Run(Method.DELETE);
        }

        public DataTable GetMultilingualLabelCategory(string categoryUri, LabelCategoryViewModel labelCategory = null,
            List<SystemLanguageViewModel> languages = null)
        {
            var labelsDataTable = new DataTable();
            var labelCategoryViewModel = new LabelCategoryViewModel();
            var systemLanguages = languages == null ? GetSystemLanguages() : languages;

            if (categoryUri != null)
            {
                if (labelCategory == null)
                {
                    labelCategoryViewModel = GetLabelCategory(categoryUri);
                }
                else
                {
                    labelCategoryViewModel = labelCategory;
                }
            }
            else
            {
                var multilingualLabel = new List<MultilingualLabelCategory>();
                var multilangCategory = new MultilingualLabelCategory();
                multilangCategory.lang = "en";
                multilangCategory.text = "New label category";
                multilingualLabel.Add(multilangCategory);

                var newLabelCategory = new LabelCategoryViewModel();
                newLabelCategory.id = "";
                newLabelCategory.name = "New label category";
                newLabelCategory.contains_businessprocesses = false;
                newLabelCategory.used_for_authorization = false;
                newLabelCategory.multi_lang_name = multilingualLabel;
                labelCategoryViewModel = newLabelCategory;
            }

            labelsDataTable.Columns.Add(new DataColumn("id", typeof (string)));
            labelsDataTable.Columns.Add(new DataColumn("uri", typeof (string)));

            //Create column
            IList<MultilingualLabelCategory> multilingualLabelCategory = labelCategoryViewModel.multi_lang_name.ToList();
            var LabelLanguagesList = multilingualLabelCategory.Select(s => s.lang).ToList();

            labelsDataTable.Columns.Add("lang_en", typeof (string));
            foreach (var language in systemLanguages)
            {
                if (language.Id != "en")
                {
                    labelsDataTable.Columns.Add(new DataColumn("lang_" + language.Id, typeof (string)));
                }
            }

            var record = labelsDataTable.NewRow();
            record["id"] = labelCategoryViewModel.id;
            record["uri"] = labelCategoryViewModel.uri;
            foreach (var text in systemLanguages)
            {
                if (LabelLanguagesList.Contains(text.Id))
                {
                    var labelText =
                        multilingualLabelCategory.Where(t => t.lang == text.Id).Select(l => l.text).FirstOrDefault();
                    record["lang_" + text.Id] = labelText != "null" ? labelText : "";
                }
                else
                {
                    record["lang_" + text.Id] = "";
                }
            }
            labelsDataTable.Rows.Add(record);
            return labelsDataTable;
        }

        public DataTable GetLabelsGrid(string labelsUri, string categoryUri, int page, int pagesize,
            List<SystemLanguageViewModel> languages = null)
        {
            var labelsDataTable = new DataTable();
            labelsDataTable.Columns.Add(new DataColumn("id", typeof (string)));
            labelsDataTable.Columns.Add(new DataColumn("Uri", typeof (string)));
            labelsDataTable.Columns.Add(new DataColumn("enabled", typeof (bool)));
            labelsDataTable.Columns.Add(new DataColumn("abbreviation", typeof (string)));
            labelsDataTable.Columns.Add(new DataColumn("system", typeof (bool)));

            if (!string.IsNullOrEmpty(labelsUri))
            {
                var labelService = new LabelService();
                if (!labelsUri.Contains("multilingual=yes"))
                {
                    if (!labelsUri.Contains("?"))
                    {
                        labelsUri = labelsUri + "?multilingual=yes" + "&limit=" + pagesize + "&offset=" +
                                    UtilitiesHelper.CalculateOffset(page, pagesize);
                    }
                    else
                    {
                        labelsUri = labelsUri + "&multilingual=yes" + "&limit=" + pagesize + "&offset=" +
                                    UtilitiesHelper.CalculateOffset(page, pagesize);
                    }
                }
                else
                {
                    if (!labelsUri.Contains("?"))
                    {
                        labelsUri = labelsUri + "?limit=" + pagesize + "&offset=" +
                                    UtilitiesHelper.CalculateOffset(page, pagesize);
                    }
                    else
                    {
                        labelsUri = labelsUri + "&limit=" + pagesize + "&offset=" +
                                    UtilitiesHelper.CalculateOffset(page, pagesize);
                    }
                }

                var labelsModels = labelService.GetLabels(labelsUri);
                IEnumerable<SystemLanguageViewModel> systemLanguages = languages == null
                    ? GetSystemLanguages()
                    : languages;
                labelsDataTable.Columns.Add("lang_en");
                foreach (var language in systemLanguages)
                {
                    if (!language.Id.Equals("en"))
                    {
                        labelsDataTable.Columns.Add(new DataColumn("lang_" + language.Id, typeof (string)));
                    }
                }

                foreach (var labelViewModel in labelsModels.Data)
                {
                    var record = labelsDataTable.NewRow();
                    record["id"] = labelViewModel.id;
                    record["Uri"] = labelViewModel.Uri;
                    record["abbreviation"] = string.IsNullOrWhiteSpace(labelViewModel.abbreviation)
                        ? ""
                        : labelViewModel.abbreviation;
                    record["enabled"] = labelViewModel.enabled;
                    record["system"] = labelViewModel.system;
                    foreach (var text in systemLanguages)
                    {
                        var labelText =
                            labelViewModel.multi_lang_name.Where(t => t.lang.Equals(text.Id))
                                .Select(l => l.text)
                                .FirstOrDefault();
                        record["lang_" + text.Id] = labelText != null ? labelText : "";
                    }
                    labelsDataTable.Rows.Add(record);
                }
            }
            else
            {
                labelsDataTable.Columns.Add(new DataColumn("lang_en", typeof (string)));
            }

            return labelsDataTable;
        }

        private static SystemInformationViewModel GetSystemInformation()
        {
            var version = SessionHelper.Initialize().Version;
            var systemInformationService = new SystemInformationService();
            return systemInformationService.GetSystemInformation(
                    version.GetEntryByName("system_information").Uri.ToString());
        }

        private List<string> SortAvailableLanguages(List<string> activeLanguages)
        {
            var dafaultLanguage = new List<string>();
            var languages = new List<string>();
            var systemLanguages = GetSystemLanguages();
            if (activeLanguages == null)
            {
                dafaultLanguage = systemLanguages.Where(l => l.Id == "en").Select(c => c.Id).ToList();
                languages = systemLanguages.Select(s => s.Id).ToList();
            }
            else
            {
                dafaultLanguage = activeLanguages.Where(e => e == "en").ToList();
                languages = activeLanguages.Except(dafaultLanguage).OrderBy(q => q).ToList();
            }
            return dafaultLanguage.Union(languages).ToList();
        }
    }
}
