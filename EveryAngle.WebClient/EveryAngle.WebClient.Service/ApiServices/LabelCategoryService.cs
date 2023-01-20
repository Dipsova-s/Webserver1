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
            var version = AuthorizationHelper.Initialize().Version;
            var systemSettings = AuthorizationHelper.Initialize().SystemSettings;
            var globalSettingService = new GlobalSettingService();
            var systemLanguages =
                globalSettingService.GetSystemLanguages(version.GetEntryByName("system_languages").Uri +
                                                        "?enabled=true&" +
                                                        UtilitiesHelper.GetOffsetLimitQueryString(1,
                                                            systemSettings.max_pagesize));
            return systemLanguages.Data;
        }

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

        public void DeleteLabelCategory(string labelCategoryUri)
        {
            var requestManager = RequestManager.Initialize(labelCategoryUri);
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
            var token = jsonResult.SelectToken("labels") ?? jsonResult.SelectToken("business_processes");
            var label = new ListViewModel<LabelViewModel>
            {
                Data = JsonConvert.DeserializeObject<List<LabelViewModel>>(token.ToString()),
                Header = JsonConvert.DeserializeObject<HeaderViewModel>(jsonResult.SelectToken("header").ToString())
            };
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

        public LabelCategoryViewModel UpdateNewCategoryLabel(string modelUri, string updatedLabel)
        {
            var requestManager = RequestManager.Initialize(modelUri);
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
            DataTable labelsDataTable = new DataTable();
            LabelCategoryViewModel labelCategoryViewModel;
            List<SystemLanguageViewModel> systemLanguages = languages ?? GetSystemLanguages();

            if (categoryUri != null)
            {
                labelCategoryViewModel = labelCategory ?? GetLabelCategory(categoryUri);
            }
            else
            {
                List<MultilingualLabelCategory> multilingualLabel = new List<MultilingualLabelCategory>();
                MultilingualLabelCategory multilangCategory = new MultilingualLabelCategory
                {
                    lang = "en",
                    text = "New label category"
                };
                multilingualLabel.Add(multilangCategory);

                var newLabelCategory = new LabelCategoryViewModel
                {
                    id = "",
                    name = "New label category",
                    contains_businessprocesses = false,
                    used_for_authorization = false,
                    multi_lang_name = multilingualLabel
                };
                labelCategoryViewModel = newLabelCategory;
            }

            labelsDataTable.Columns.Add(new DataColumn("id", typeof(string)));
            labelsDataTable.Columns.Add(new DataColumn("uri", typeof(string)));

            //Create column
            IList<MultilingualLabelCategory> multilingualLabelCategory = labelCategoryViewModel.multi_lang_name.ToList();
            var labelLanguagesList = multilingualLabelCategory.Select(s => s.lang).ToList();

            labelsDataTable.Columns.Add("lang_en", typeof(string));
            foreach (var language in systemLanguages)
            {
                if (language.Id != "en")
                {
                    labelsDataTable.Columns.Add(new DataColumn("lang_" + language.Id, typeof(string)));
                }
            }

            DataRow record = GetLabelMultilingualDataRow(labelsDataTable, labelCategoryViewModel, systemLanguages, multilingualLabelCategory, labelLanguagesList);
            labelsDataTable.Rows.Add(record);
            return labelsDataTable;
        }

        private static DataRow GetLabelMultilingualDataRow(DataTable labelsDataTable,
            LabelCategoryViewModel labelCategoryViewModel,
            List<SystemLanguageViewModel> systemLanguages,
            IList<MultilingualLabelCategory> multilingualLabelCategory,
            List<string> labelLanguagesList)
        {
            DataRow record = labelsDataTable.NewRow();
            record["id"] = labelCategoryViewModel.id;
            record["uri"] = labelCategoryViewModel.uri;
            foreach (var text in systemLanguages)
            {
                if (labelLanguagesList.Contains(text.Id))
                {
                    var labelText = multilingualLabelCategory.FirstOrDefault(t => t.lang == text.Id)?.text;
                    record["lang_" + text.Id] = labelText != "null" ? labelText : "";
                }
                else
                {
                    record["lang_" + text.Id] = "";
                }
            }

            return record;
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
                string newLabelsUri = labelsUri;
                newLabelsUri += !newLabelsUri.Contains("?") ? "?" : "&";
                newLabelsUri += UtilitiesHelper.GetOffsetLimitQueryString(page, pagesize);
                newLabelsUri += !newLabelsUri.Contains("multilingual=yes") ? "&multilingual=yes" : "";

                LabelService labelService = new LabelService();
                ListViewModel<LabelViewModel> labelsModels = labelService.GetLabels(newLabelsUri);
                IEnumerable<SystemLanguageViewModel> systemLanguages = languages ?? GetSystemLanguages();
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
                    DataRow record = GetLabelDataRow(labelsDataTable, systemLanguages, labelViewModel);
                    labelsDataTable.Rows.Add(record);
                }
            }
            else
            {
                labelsDataTable.Columns.Add(new DataColumn("lang_en", typeof (string)));
            }

            return labelsDataTable;
        }

        private static DataRow GetLabelDataRow(DataTable labelsDataTable,
            IEnumerable<SystemLanguageViewModel> systemLanguages,
            LabelViewModel labelViewModel)
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
                var labelText = labelViewModel.multi_lang_name.FirstOrDefault(t => t.lang.Equals(text.Id))?.text;
                record["lang_" + text.Id] = labelText ?? "";
            }

            return record;
        }
    }
}
