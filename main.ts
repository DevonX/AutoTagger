import { Plugin, App, PluginSettingTab, ButtonComponent, TextComponent, AbstractInputSuggest} from 'obsidian';
//This interface is mandatory for the settings to work. Sets up the types for the settings.
interface AutoTaggerSettings {
    dateFormat: string;
    tags: string[];
    test: string;
}
//This is the default settings for the plugin. This is what will be used if the user has not set any settings.
const DEFAULT_SETTINGS: Partial<AutoTaggerSettings> = {
    dateFormat: "YYYY-MM-DD",
};
//This is the main class for the plugin. This is where the plugin will be initialized.
export default class AutotaggerPlugin extends Plugin {
    settings: AutoTaggerSettings;
    //this one loads the settings
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }
    //This is the main function that will be called when the plugin is loaded.
    async onload() {
        await this.loadSettings();
        Object.assign({}, await this.loadData());
        this.addSettingTab(new AutotaggerSettingTab(this.app, this));
        //This is where the button is created
        const button = createEl("button", { cls: "your-button-css-class" });
        const buttonSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>';
        button.innerHTML = buttonSVG;
        button.onclick = () => {
            console.log("BUTTON CLICKED");
        }
        //This is where the button is appended to the DOM
        const target = document.getElementsByClassName("app-container")[0];
        target.appendChild(button);
    }
    //This is where the settings are saved
    async saveSettings() {
        await this.saveData(this.settings);
    }
}
//This is the class where the TagSuggester is created. This is where the tags are suggested to the user.
export class TagSuggester extends AbstractInputSuggest<string> {
    private inputEl: HTMLInputElement

    constructor(app: App, inputEl: HTMLInputElement) {
        super(app, inputEl);
        this.inputEl = inputEl;
    }

    getSuggestions(input: string): Array<string> {
        // @ts-ignore
        const getAllTags = this.app.metadataCache.getTags();
        const filteredTags = Object.keys(getAllTags).filter((tag: string) => tag.toLowerCase().includes(input.toLowerCase()));
        return filteredTags;
    }

    renderSuggestion(filteredTags: string, el: HTMLElement): void {
        el.createSpan({text: filteredTags, cls: "borderTestClass" })
        el.addEventListener('click', () => this.selectSuggestion(filteredTags));
    }

    selectSuggestion(filteredTag: string): void {
        this.inputEl.value = filteredTag;
        this.onTagSelected(filteredTag);
        this.close();
    }
    onTagSelected(tag: string): void {
        // This method will be overridden in the ExampleSettingTab class
    }
}
//This is the class where the settings tab is created. This is where the user can set the settings for the plugin.
class AutotaggerSettingTab extends PluginSettingTab {
    plugin: AutotaggerPlugin;
    tagList: HTMLElement;
    containerEl: HTMLElement;
  
    constructor(app: App, plugin: AutotaggerPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    //This is where the settings are displayed to the user.
    display() {
        this.displayTags(this.containerEl);  
    }
    //This is the button that adds a new chain.
    chainButton() {
        new ButtonComponent(this.containerEl.createEl("div", {cls: "chainButton"})).setButtonText("New Chain").onClick(() => {
            console.log("Button Clicked");
            const newContainer = this.createNewChainContainer();
            this.plugin.settings.tags.push();
            this.plugin.saveSettings();
            this.displayTags(newContainer);
        });
    }
    //This is the function that creates a new chain container.
    createNewChainContainer() {
        return this.containerEl.createDiv({ cls: "tagContainer" });
    }
    //This is the function that displays the tags to the user.
    displayTags(containerEl: HTMLElement) {       
        containerEl.empty();

        this.tagList = containerEl.createDiv({ cls: "tagList" });
        const containerElement = containerEl.createDiv({ cls: "inputContainerContainer" });
        const tagNameTextComponent = new TextComponent(containerElement);
        //This is where the tag suggester is created
        const tagSuggester = new TagSuggester(this.app, tagNameTextComponent.inputEl);
        tagSuggester.onTagSelected = (tag: string) => {
            if (tag) {
                tagNameTextComponent.setValue('');
                this.displayTags(containerEl);
                this.plugin.saveSettings();
                //push the tag to the array
                this.plugin.settings.tags.push(tag);
            }
        };
        //This is called to clear the container
        this.tagList.empty();
        //This goes through the tags and creates a button for each tag
        this.plugin.settings.tags.forEach(tag => {
            const metaButton = this.tagList.createDiv({ cls: "divBorder" })
        //This is where the button is created
        new ButtonComponent(metaButton)
            .setButtonText(tag)
            .onClick(() => {
                const index = this.plugin.settings.tags.indexOf(tag);
                if (index > -1) {
                    this.plugin.settings.tags.splice(index, 1);
                }
                this.display();
                this.plugin.saveSettings();
            });
        });
        //This is where the chainButton button is created
        this.chainButton();
    }
}
