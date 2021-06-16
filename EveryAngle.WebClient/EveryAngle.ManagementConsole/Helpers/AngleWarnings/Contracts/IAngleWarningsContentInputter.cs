using Newtonsoft.Json.Linq;

namespace EveryAngle.ManagementConsole.Helpers
{
    public interface IAngleWarningsContentInputter
    {
        bool TryReadInputList();
        int CountFieldMatches(string warning, JObject angleWarningsResult);
        AngleWarningsContentInput GetInputBySolutionClassAndField(string warning, string objectClass, string field, string jump);
        AngleWarningsContentInput GetSolveItem(string warning, string objectClass, string field, string jump);
    }
}