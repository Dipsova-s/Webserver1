using EveryAngle.Core.ViewModels.Model;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public interface IAngleWarningsFileService
    {
        AngleWarningsFileViewModel Download();
    }
}