import { Plugin, App, Setting, PluginSettingTab, ButtonComponent, TextComponent } from 'obsidian';

class ExamplePluginSettings {
	dateFormat: string;
	tags: string[] = [];
}
export default class examplePlugin extends Plugin {
	settings: ExamplePluginSettings;
	
	async onload() {
		// Add settings tab
		this.settings = Object.assign({}, await this.loadData(), {dateFormat: 'defaultFormat'});
        this.addSettingTab(new ExampleSettingTab(this.app, this));

		const button = createEl("button", {cls: "your-button-css-class"});
		const buttonSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>';
		button.innerHTML = buttonSVG;
		button.onclick = () => {
			/* Do something */
			console.log("BUTTON CLICKED");
		}
		
		// Search for the place to add the button to, in this case, the main app container
		const target = document.getElementsByClassName( "app-container")[0];
		target.appendChild(button);
	}
	async saveSettings() {
        await this.saveData(this.settings);
    }
}

class ExampleSettingTab extends PluginSettingTab {
    plugin: examplePlugin;
    tagList: HTMLUListElement;
    
    constructor(app: App, plugin: examplePlugin) {
        super(app, plugin);
        this.plugin = plugin;
		console.log('ExampleSettingTab constructor:', app, plugin);
    }

    display(): void {
		console.log('Display called');
        const { containerEl } = this;

        containerEl.empty();

        const inputContainer = containerEl.createEl('div', {cls: "inputContainer"});

        let tagNameTextComponent: TextComponent;

        new Setting(inputContainer)
            .setName('Tag name')
            .setDesc('Enter a tag name here')
            .addText(text => {
                text.setPlaceholder('Tag name here')
                    .setValue('');
                tagNameTextComponent = text;
				console.log('tagNameTextComponent:', tagNameTextComponent);
            });

        new ButtonComponent(inputContainer)
            .setButtonText('Add Tag')
            .onClick(() => {
                const tagNameInputValue = tagNameTextComponent.getValue();
				console.log('onClick:', tagNameInputValue, this.plugin.settings.tags);

                if (tagNameInputValue) {
                    this.plugin.settings.tags.push(tagNameInputValue);
                    tagNameTextComponent.setValue('');
                    this.displayTags(); // Call the displayTags method to update the tag list
                    this.plugin.saveSettings();
                }
            });

        this.tagList = containerEl.createEl('ul');
        this.displayTags();
    }

    displayTags() {
		console.log('displayTags called');
        this.tagList.empty();
		console.log('tagList after empty:', this.tagList);

		if (!this.plugin.settings.tags) {
			this.plugin.settings.tags = [];
		}

        this.plugin.settings.tags.forEach(tag => {
			console.log('Current tag:', tag);
            const tagItem = this.tagList.createEl('li', {text: tag, cls: 'listMargin'});
            const deleteButton = tagItem.createEl('button', {cls: 'removeButton'});

			new ButtonComponent(deleteButton)
				.setButtonText('Delete')
				.onClick(() => {
					this.plugin.settings.tags = this.plugin.settings.tags.filter(t => t !== tag);
					console.log('Tags after deletion:', this.plugin.settings.tags);
					this.displayTags();
					this.plugin.saveSettings();
            });
        });
    }
}
