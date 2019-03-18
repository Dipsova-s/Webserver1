using System.Collections.Generic;
using System.Linq;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.DownloadTable;
using EveryAngle.WebClient.Service.HttpHandlers;
using Newtonsoft.Json;
using RestSharp;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class DownloadTableService : BaseService, IDownloadTableService
    {
        #region Contructor

        #endregion

        public DownloadTableViewModel GetDownloadTable(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            var result = JsonConvert.DeserializeObject<DownloadTableViewModel>(jsonResult.ToString());
            return result;
        }

        #region Method

        public ListViewModel<DownloadTableViewModel> GetDownloadTables(string uri)
        {
            List<DownloadTableViewModel> tables = GetArrayItems<DownloadTableViewModel>(uri).ToList();
            return new ListViewModel<DownloadTableViewModel>
            {
                Data = tables,
                Header = new HeaderViewModel
                {
                    Total = tables.Count
                }
            };
        }

        public ListViewModel<DownloadTableFieldViewModel> GetDownloadTableFields(string uri, bool isEnabled)
        {
            var fieldResult = new ListViewModel<DownloadTableFieldViewModel>();

            var clientManagerGetDownloadTableFields = RequestManager.Initialize(uri);
            var jsonResultFields = clientManagerGetDownloadTableFields.Run();
            if (jsonResultFields.SelectToken("fields") != null)
            {
                var downloadTableFields =
                    JsonConvert.DeserializeObject<List<DownloadTableFieldViewModel>>(
                        jsonResultFields.SelectToken("fields").ToString());
                fieldResult.Data = downloadTableFields.Where(fields => fields.is_enabled == isEnabled).ToList();
                fieldResult.Header =
                    JsonConvert.DeserializeObject<HeaderViewModel>(jsonResultFields.SelectToken("header").ToString());
                fieldResult.Header.Total = fieldResult.Data.Count;
            }
            return fieldResult;
        }

        public DownloadTableFieldViewModel GetDownloadTableField(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run();
            var downloadTableField = JsonConvert.DeserializeObject<DownloadTableFieldViewModel>(jsonResult.ToString());
            return downloadTableField;
        }


        public void UpdateDownloadTableField(string uri, string downloadTableField)
        {
            var requestManager = RequestManager.Initialize(uri);
            requestManager.Run(Method.PUT,downloadTableField);
        }

        #endregion
    }
}
