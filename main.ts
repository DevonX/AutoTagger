import { Plugin, App, PluginSettingTab, ButtonComponent, TextComponent, CachedMetadata, AbstractInputSuggest, Setting} from 'obsidian';

class ExamplePluginSettings {
    tags: string[] = [];
}

export default class examplePlugin extends Plugin {
    settings: ExamplePluginSettings;

    async onload() {
        // Load settings
        this.settings = Object.assign({}, await this.loadData());
        this.addSettingTab(new ExampleSettingTab(this.app, this));

        // Add button to the app container
        const button = createEl("button", { cls: "your-button-css-class" });
        const buttonSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>';
        button.innerHTML = buttonSVG;
        button.onclick = () => {
            console.log("BUTTON CLICKED");
        }

        const target = document.getElementsByClassName("app-container")[0];
        target.appendChild(button);
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

const renderTags = app.metadataCache.getTags();

export class TagSuggester extends AbstractInputSuggest<string> {
    private inputEl: HTMLInputElement

    constructor(app: App, inputEl: HTMLInputElement) {
        super(app, inputEl);
        this.inputEl = inputEl;
    }

    getSuggestions(inputStr: string): Array<string> {
        return Object.keys(renderTags);
    }

    renderSuggestion(folder: string, el: HTMLElement): void {
        el.createDiv();
        renderTags();
    }

    selectSuggestion(folder: string): void {
        this.inputEl.value = folder;
        this.close();
    }
}

class ExampleSettingTab extends PluginSettingTab {
    plugin: examplePlugin;
    tagList: HTMLElement;
    cachedMetadata: CachedMetadata;

    constructor(app: App, plugin: examplePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        // Clear the container
        containerEl.empty();
        const containerElement = containerEl.createDiv({ cls: "inputContainer" });

        const tagNameTextComponent = new TextComponent(containerElement);

        new Setting(containerElement).addSearch(search => {
            new TagSuggester(this.app, tagNameTextComponent.inputEl);
        });
            
/*         new ButtonComponent(containerElement)
            .setButtonText('Add Tag')
            .onClick(() => {
                const tagNameInputValue = tagNameTextComponent.getValue();
                if (tagNameInputValue) {
                    this.plugin.settings.tags.push(tagNameInputValue);
                    tagNameTextComponent.setValue('');
                    this.displayTags();
                    this.plugin.saveSettings();
                }
            }); */

        this.tagList = containerEl.createEl('ul');
        this.displayTags();

    }

    displayTags() {
        this.tagList.empty();

        if (!this.plugin.settings.tags) {
            this.plugin.settings.tags = [];
        }

        this.plugin.settings.tags.forEach(tag => {
            const tagItem = this.tagList.createEl('li', { text: tag, cls: 'listMargin' });
            const deleteButton = tagItem.createEl('button', { cls: 'removeButton' });

            new ButtonComponent(deleteButton)
                .setButtonText('Delete')
                .onClick(() => {
                    const index = this.plugin.settings.tags.indexOf(tag);
                    if (index > -1) {
                        this.plugin.settings.tags.splice(index, 1);
                    }
                    this.displayTags();
                    this.plugin.saveSettings();
                });
        });
    }
}
