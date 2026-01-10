
import os

file_path = r'c:\Users\castr\Documents\Codexya\index.html'

old_str = '''                        <div class="product-overlay">
                            <button class="btn-quick-view">Vista Rápida</button>
                        </div>'''

new_str = '''                        <div class="product-overlay">
                            <button class="btn-icon-action" aria-label="Añadir al carrito">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="9" cy="21" r="1"></circle>
                                    <circle cx="20" cy="21" r="1"></circle>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                </svg>
                            </button>
                            <button class="btn-quick-view">Vista Rápida</button>
                        </div>'''

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_content = content.replace(old_str, new_str)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully updated product cards")
