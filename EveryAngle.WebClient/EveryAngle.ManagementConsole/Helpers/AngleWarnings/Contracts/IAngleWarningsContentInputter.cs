using EveryAngle.Core.ViewModels.Model;
using EveryAngle.ManagementConsole.Helpers.AngleWarnings;

namespace EveryAngle.ManagementConsole.Helpers
{
    public interface IAngleWarningsContentInputter
    {
        void Initialize(string fieldSourcesUri, string classesUri);
        bool TryReadInputList();
        ItemSolver GetSolveItem(string warning, string objectClass, string field, string jump);
    }
}