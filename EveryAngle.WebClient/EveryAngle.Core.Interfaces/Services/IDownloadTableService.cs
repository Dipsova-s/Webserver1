using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.DownloadTable;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface IDownloadTableService
    {
        ListViewModel<DownloadTableViewModel> GetDownloadTables(string uri);
        DownloadTableViewModel GetDownloadTable(string uri);
        ListViewModel<DownloadTableFieldViewModel> GetDownloadTableFields(string uri, bool isEnabled);
        DownloadTableFieldViewModel GetDownloadTableField(string downloadTableFieldUri);
        void UpdateDownloadTableField(string uri, string downloadTableField);
    }
}
