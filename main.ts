import { Plugin, App, PluginSettingTab, ButtonComponent, TextComponent, SuggestModal, getAllTags} from 'obsidian';
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
        const buttonSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>';
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
class TagSuggestModal extends SuggestModal<string> {
    private suggestions: string[];
    private onSelect: (value: string) => void;
    allTags: ExampleSettingTab;

    constructor(app: App, suggestions: string[], onSelect: (value: string) => void) {
        super(app);
        this.suggestions = suggestions;
        this.onSelect = onSelect;
    }
    getSuggestions(query: string): string[] {
        const cache = this.app.metadataCache.getCache('') || { tags: [] };
        const allTags = getAllTags(cache);
        if (allTags) {
            return allTags.filter(tag => tag.toLowerCase().includes(query.toLowerCase()));
        }
        return [];
    }

    renderSuggestion(suggestion: string, el: HTMLElement): void {
        el.createEl("div", { text: suggestion });
    }

    onChooseSuggestion(suggestion: string, evt: MouseEvent | KeyboardEvent): void {
        this.onSelect(suggestion);
    }
}
class ExampleSettingTab extends PluginSettingTab {
    plugin: examplePlugin;
    tagList: HTMLElement;

    constructor(app: App, plugin: examplePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();

        const inputContainer = containerEl.createDiv({ cls: "inputContainer" });


        const tagNameTextComponent = new TextComponent(inputContainer);
        tagNameTextComponent
            .setPlaceholder('Tag name here')
            .setValue('')
            .onChange(() => {
                suggester.open();
            })
            ;

        new ButtonComponent(inputContainer)
            .setButtonText('Add Tag')
            .onClick(() => {
                const tagNameInputValue = tagNameTextComponent.getValue();
                if (tagNameInputValue) {
                    this.plugin.settings.tags.push(tagNameInputValue);
                    tagNameTextComponent.setValue('');
                    this.displayTags();
                    this.plugin.saveSettings();
                }

            });

        this.tagList = containerEl.createEl('ul');
        this.displayTags();

        const cache = this.app.metadataCache.getCache('') || { tags: [] };
        const allTags = getAllTags(cache) || []; // Provide a default empty array if getAllTags returns null

        const suggester = new TagSuggestModal(this.app, allTags, (tag) => {
            this.plugin.settings.tags.push(tag);
            this.displayTags();
            this.plugin.saveSettings();
        });
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
                    this.plugin.settings.tags = this.plugin.settings.tags.filter(t => t !== tag);
                    this.displayTags();
                    this.plugin.saveSettings();
                });
        });
    }
}