using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Logging;
using EveryAngle.ManagementConsole.Helpers.AngleWarnings;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;

namespace EveryAngle.ManagementConsole.Helpers
{
    public class AngleWarningsContentInputter : IAngleWarningsContentInputter
    {
        private readonly IAngleWarningsFileReader _angleWarningsFileReader;

        public List<AngleWarningsContentInput> ContentInputList;

        public AngleWarningsContentInputter(IAngleWarningsFileReader angleWarningsFileReader)
        {
            _angleWarningsFileReader = angleWarningsFileReader ?? throw new System.ArgumentNullException(nameof(angleWarningsFileReader));

            ContentInputList = new List<AngleWarningsContentInput>();
        }

        private void AddContentInputItem(WarningFix fix, string version, string objectClass, string fieldToReplace, string newField)
        {
            ContentInputList.Add(new AngleWarningsContentInput(fix, version, objectClass, fieldToReplace, newField));
        }

        public bool TryReadInputList()
        {
            bool succeeded = true;

            try
            {
                ContentInputList.Clear();

                List<string> csvData = _angleWarningsFileReader.ReadContentInputExcelFileFromDisk();

                foreach (string line in csvData)
                {
                    string[] inputLine = line.Split(',');
                 
                    WarningFix warningFix = InputContentMapper.GetWarningTypeEnum(inputLine[1]);
                    if (warningFix == WarningFix.NotSupportedMethod)
                    {
                        continue;
                    }

                    if (inputLine.Length < 6)
                    {
                        throw new Exception("All row must have at least six columns.");
                    }

                    AddContentInputItem(warningFix, inputLine[2], inputLine[3], inputLine[4], inputLine[5]);
                }

                ContentInputList = ContentInputList.OrderBy(x => x.Order).ToList();

                CheckIfFieldHasChangedAgainInLaterReleases();
            }
            catch (Exception ex)
            {
                Log.SendWarning("Angle warnings, reading input file failed: {0}", ex.Message);
                succeeded = false;
            }

            return succeeded;
        }

        private void CheckIfFieldHasChangedAgainInLaterReleases()
        {
            foreach (var item in ContentInputList)
            {
                AngleWarningsContentInput contentInput;
                do
                {
                    contentInput = item.Fix == WarningFix.ReplaceClass
                        ? GetFirstNewContentInputItem(item.Fix, item.NewFieldOrClass, item.Order, item.NewFieldOrClass)
                        : GetFirstNewContentInputItem(item.Fix, item.ObjectClass, item.Order, item.NewFieldOrClass);

                    if (contentInput != default(AngleWarningsContentInput))
                    {
                        item.NewFieldOrClass = contentInput.NewFieldOrClass;
                    }

                } while (contentInput != default(AngleWarningsContentInput));
            }
        }

        private AngleWarningsContentInput GetFirstNewContentInputItem(WarningFix fix, string objectClass, int order, string newField)
        {
            return ContentInputList.FirstOrDefault(x => x.Fix == fix &&
                                         x.ObjectClass == objectClass &&
                                         x.Order > order &&
                                         x.FieldOrClassToReplace == newField);
        }

        private AngleWarningsContentInput GetContentInputItemReference(string objectClass, string oldReference)
        {
            return ContentInputList.FirstOrDefault(x => x.Fix == WarningFix.ReplaceReference &&
                                                   x.ObjectClass == objectClass &&
                                                   x.FieldOrClassToReplace == oldReference);


        }

        private AngleWarningsContentInput GetContentInputItemFieldChanged(string newReference, string oldField)
        {
            return ContentInputList.FirstOrDefault(x => x.Fix == WarningFix.ReplaceField &&
                                                   x.ObjectClass == newReference &&
                                                   x.FieldOrClassToReplace == oldField);
        }

        private AngleWarningsContentInput GetContentInputItemField(string objectClass, string oldField)
        {
            return ContentInputList.FirstOrDefault(x => x.Fix == WarningFix.ReplaceField &&
                                                   x.ObjectClass == objectClass &&
                                                   x.FieldOrClassToReplace == oldField);
        }

        public AngleWarningsContentInput GetSolveItem(string warning, string objectClass, string field, string jump)
        {
            ItemSolver itemSolver = new ItemSolver
            {
                Fix = WarningFix.NotSupportedMethod
            };

            string fieldToCheck = "";

            if (jump != null)
            {
                AngleWarningsContentInput contentInput = ContentInputList.FirstOrDefault(x => InputContentMapper.Maps(x.Fix, warning) &&
                                                                                         x.ObjectClass == objectClass &&
                                                                                         x.FieldOrClassToReplace == jump);
                
                if (contentInput != null)
                {
                    itemSolver.Fix = contentInput.Fix;
                    itemSolver.ObjectClass = objectClass;
                    itemSolver.FieldOrClassToReplace = jump;
                    itemSolver.NewFieldOrClass = contentInput.NewFieldOrClass;
                }

                return itemSolver;
            }

            if (InputContentMapper.Maps(WarningFix.ReplaceReference, warning))
            {
                if (jump != null)
                {
                    AngleWarningsContentInput contentInput = ContentInputList.FirstOrDefault(x => x.Fix == WarningFix.ReplaceSublist &&
                                                                                             x.ObjectClass == objectClass &&
                                                                                             x.FieldOrClassToReplace == jump);

                    if (contentInput != null)
                    {
                        itemSolver.Fix = contentInput.Fix;
                        itemSolver.ObjectClass = objectClass;
                        itemSolver.FieldOrClassToReplace = jump;
                        itemSolver.NewFieldOrClass = contentInput.NewFieldOrClass;
                    }

                    return itemSolver;
                }
                else
                {
                    string oldReference = GetReferenceFromReferenceField(field);
                    string oldField = GetFieldFromReferenceField(field);

                    AngleWarningsContentInput contentInput = GetContentInputItemReference(objectClass, oldReference);
                    if (contentInput != null)
                    {
                        AngleWarningsContentInput contentInput2 = GetContentInputItemFieldChanged(contentInput.NewFieldOrClass, oldField);
                        if (contentInput2 != null)
                        {
                            itemSolver.Fix = contentInput.Fix;
                            itemSolver.ObjectClass = objectClass;
                            itemSolver.FieldOrClassToReplace = field;
                            itemSolver.NewFieldOrClass = contentInput.NewFieldOrClass + "__" + contentInput2.NewFieldOrClass;
                        }
                        else
                        {
                            itemSolver.Fix = contentInput.Fix;
                            itemSolver.ObjectClass = objectClass;
                            itemSolver.FieldOrClassToReplace = field;
                            itemSolver.NewFieldOrClass = contentInput.NewFieldOrClass + "__" + oldField;
                        }

                        return itemSolver;
                    }
                }
            }
                        
            if (InputContentMapper.Maps(WarningFix.ReplaceField, warning))
            {
                string objectToCheck = ConstructFieldToCheck(objectClass, field);

                string oldObject = GetObjectFromField(objectClass, field);
                string oldField = GetFieldFromField(field);

                AngleWarningsContentInput contentInput = ContentInputList.FirstOrDefault(x => x.Fix == WarningFix.ReplaceField &&
                                                                                         x.ObjectClass == oldObject &&
                                                                                         x.FieldOrClassToReplace == oldField);
                if (contentInput != null)
                {
                    itemSolver.Fix = contentInput.Fix;
                    itemSolver.ObjectClass = oldObject;
                    itemSolver.FieldOrClassToReplace = field;

                    if (objectClass == oldObject)
                    {
                        itemSolver.NewFieldOrClass = contentInput.NewFieldOrClass;
                    }
                    else
                    {
                        itemSolver.NewFieldOrClass = oldObject + "__" + contentInput.NewFieldOrClass;
                    }
                }

                return itemSolver;
            }

            if (InputContentMapper.Maps(WarningFix.ReplaceSublist, warning))
            {
                AngleWarningsContentInput contentInput = ContentInputList.FirstOrDefault(x => x.Fix == WarningFix.ReplaceSublist &&
                                                                                         x.ObjectClass == objectClass &&
                                                                                         x.FieldOrClassToReplace == jump);

                if (contentInput != null)
                {
                    itemSolver.Fix = contentInput.Fix;
                    itemSolver.ObjectClass = objectClass;
                    itemSolver.FieldOrClassToReplace = jump;
                    itemSolver.NewFieldOrClass = contentInput.NewFieldOrClass;
                }

                return itemSolver;
            }

            if (InputContentMapper.Maps(WarningFix.ReplaceClass, warning))
            {
                AngleWarningsContentInput contentInput = ContentInputList.FirstOrDefault(x => x.Fix == WarningFix.ReplaceClass &&
                                                                         x.ObjectClass == objectClass &&
                                                                         x.FieldOrClassToReplace == objectClass);

                if (contentInput != null)
                {
                    itemSolver.Fix = contentInput.Fix;
                    itemSolver.ObjectClass = objectClass;
                    itemSolver.FieldOrClassToReplace = objectClass;
                    itemSolver.NewFieldOrClass = contentInput.NewFieldOrClass;
                }

                return itemSolver;
            }

            AngleWarningsContentInput contentInput3 = ContentInputList.FirstOrDefault(x => InputContentMapper.Maps(x.Fix, warning) &&
                                                                                      x.GetClassOrFieldToReplaceString().Equals(fieldToCheck, StringComparison.CurrentCultureIgnoreCase));

            if (contentInput3 != null)
            {
                itemSolver.Fix = contentInput3.Fix;
                itemSolver.ObjectClass = contentInput3.ObjectClass;
                itemSolver.FieldOrClassToReplace = contentInput3.FieldOrClassToReplace;
                itemSolver.NewFieldOrClass = contentInput3.NewFieldOrClass;

                return itemSolver;
            }

            return null;
        }

        public AngleWarningsContentInput GetInputBySolutionClassAndField(string warning, string objectClass, string field, string jump)
        {
            string fieldToCheck = "";
            AngleWarningsContentInput contentInput = null;

            if (InputContentMapper.Maps(WarningFix.ReplaceReference, warning))
            {
                if (jump != null)
                {
                    fieldToCheck = ConstructFieldToCheck(objectClass, jump);
                }
                else
                {
                    fieldToCheck = ConstructFieldToCheckFromReferenceField(objectClass, field);
                    contentInput = ContentInputList.FirstOrDefault(x => InputContentMapper.Maps(x.Fix, warning) &&
                                                                    x.GetClassOrFieldToReplaceString().Equals(fieldToCheck, StringComparison.CurrentCultureIgnoreCase));
                }

                if (contentInput != null)
                {
                    string oldReference = GetReferenceFromReferenceField(field);
                    string oldField = GetFieldFromReferenceField(field);

                    System.IO.File.WriteAllText(@"c:\temp\" + Guid.NewGuid() + ".txt", field);
                    
                    
                    AngleWarningsContentInput aci = GetInputBySolutionClassAndField("unsupported_display_field", contentInput.NewFieldOrClass, GetFieldFromReferenceField(field), null);
                    if (aci != null)
                    {
                        AngleWarningsContentInput cc = new AngleWarningsContentInput(contentInput.Fix, contentInput.Version, contentInput.ObjectClass, contentInput.FieldOrClassToReplace, contentInput.NewFieldOrClass + "__" + aci.NewFieldOrClass);
                        contentInput.NewFieldOrClass = contentInput.NewFieldOrClass + "__" + aci.NewFieldOrClass;
                        contentInput.Fix = WarningFix.ReplaceField;
                    }
                }

                if (contentInput != null)
                    return contentInput;
            }

            if (InputContentMapper.Maps(WarningFix.ReplaceField, warning))
            {
                fieldToCheck = ConstructFieldToCheck(objectClass, field);
            }

            if (InputContentMapper.Maps(WarningFix.ReplaceSublist, warning))
            {
                fieldToCheck = ConstructFieldToCheck(objectClass, jump);
            }

            if (InputContentMapper.Maps(WarningFix.ReplaceClass, warning))
            {
                fieldToCheck = ConstructFieldToCheck(objectClass, objectClass);
            }

            contentInput = ContentInputList.FirstOrDefault(x => InputContentMapper.Maps(x.Fix, warning) &&
                                                           x.GetClassOrFieldToReplaceString().Equals(fieldToCheck, StringComparison.CurrentCultureIgnoreCase));

            return contentInput;
        }

        private string ConstructFieldToCheckFromReferenceField(string objectClass, string fieldClassOrJumpToBeReplaced)
        {
            string[] split = fieldClassOrJumpToBeReplaced.Split(new string[] { "__" }, StringSplitOptions.None);
            if (split.Length == 2)
            {
                return ConstructFieldToCheck(objectClass, split[0]);

            }

            return null;
        }

        private string GetReferenceFromReferenceField(string fieldClassOrJumpToBeReplaced)
        {
            string[] split = fieldClassOrJumpToBeReplaced.Split(new string[] { "__" }, StringSplitOptions.None);
            if (split.Length == 2)
            {
                return split[0];

            }

            return null;
        }

        private string GetFieldFromReferenceField(string fieldClassOrJumpToBeReplaced)
        {
            string[] split = fieldClassOrJumpToBeReplaced.Split(new string[] { "__" }, StringSplitOptions.None);
            if (split.Length == 2)
            {
                return split[1];

            }

            return null;
        }

        private string GetObjectFromField(string objectClass, string fieldClassOrJumpToBeReplaced)
        {
            string[] split = fieldClassOrJumpToBeReplaced.Split(new string[] { "__" }, StringSplitOptions.None);
            if (split.Length == 1)
            {
                return objectClass;
            }

            if (split.Length == 2)
            {
                return split[0];
            }

            return null;
        }

        private string GetFieldFromField(string fieldClassOrJumpToBeReplaced)
        {
            string[] split = fieldClassOrJumpToBeReplaced.Split(new string[] { "__" }, StringSplitOptions.None);
            if (split.Length == 1)
            {
                return split[0];
            }

            if (split.Length == 2)
            {
                return split[1];
            }

            return null;
        }

        private string ConstructFieldToCheck(string objectClass, string field)
        {
            // If class is already part of the field, leave it like that, otherwise add the class
            string fieldToCheck = field.Contains("__")
                ? field
                : $"{objectClass}__{field}";

            return fieldToCheck;
        }

        public int CountFieldMatches(string warning, JObject angleWarningsResult)
        {
            int result = 0;
            List<AngleWarningSecondLevelViewmodel> secondLevels = JsonConvert.DeserializeObject<List<AngleWarningSecondLevelViewmodel>>(angleWarningsResult.SelectToken("data").ToString());

            foreach (AngleWarningSecondLevelViewmodel secondLevel in secondLevels)
            {
                if (GetInputBySolutionClassAndField(warning, secondLevel.Object, secondLevel.Field, secondLevel.Jump) != null)
                {
                    result += secondLevel.Count;
                }
            }

            return result;
        }
    }
}