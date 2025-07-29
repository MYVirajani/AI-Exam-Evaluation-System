from dataclasses import dataclass
from typing import Optional

@dataclass
class LectureChunk:
    module_code: str               
    source_file: str               
    chunk_id: int                   
    text: str

    def embedding_payload(self) -> str:
        """What goes to the embedder (plain text is fine)."""
        return self.text
