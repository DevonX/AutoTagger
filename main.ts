import { Plugin, App, Setting, PluginSettingTab } from 'obsidian';

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
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		const inputContainer = containerEl.createEl('div');
		inputContainer.style.display = 'flex';
		inputContainer.style.alignItems = 'center';

		const tagNameInput = new Setting(inputContainer)
			.setName('Tag name')
			.setDesc('Enter a tag name here')
			.addText(text => text
				.setPlaceholder('Tag name here')
				.setValue(''));

		const addButton = inputContainer.createEl('button', { text: 'Add Tag' });
		addButton.style.marginLeft = '10px';

		addButton.onclick = () => {
			const tagNameInputValue = tagNameInput.settingEl.querySelector('input');
			if (tagNameInputValue) {
				const tagName = tagNameInputValue.value;

				if (tagName) {
					this.plugin.settings.tags.push(tagName);
					this.plugin.saveSettings();
					this.addTagToList(tagName);
				}

				// Reset the input value after adding a tag
				tagNameInputValue.value = '';
			}
		};

		this.tagList = containerEl.createEl('ul');

		// Load the tags from the settings
		for (const tag of this.plugin.settings.tags) {
			this.addTagToList(tag);
		}
	}

	addTagToList(tag: string): void {
		const listItem = this.tagList.createEl('li');
		listItem.style.marginBottom = '15px';
		listItem.createEl('span', { text: tag });

		const removeButton = listItem.createEl('button', { text: 'Remove' });
		removeButton.style.float = 'right';
		removeButton.style.marginLeft = '15px';

		removeButton.onclick = () => {
			const index = this.plugin.settings.tags.indexOf(tag);
			if (index > -1) {
				this.plugin.settings.tags.splice(index, 1);
				this.plugin.saveSettings();
			}
			listItem.remove();
		};
	}

	onunload() {
		this.plugin.settings.tags = Array.from(this.tagList.children).map((child: HTMLElement) => child.textContent || '');
		this.plugin.saveSettings();
	}
}
